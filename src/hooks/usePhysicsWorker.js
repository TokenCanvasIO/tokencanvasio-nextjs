import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PhysicsWorker from '../workers/physics.worker.js?worker';
import { LowPassFilter } from '../utils/LowPassFilter';
import toast from 'react-hot-toast';

const bubbleCountLimits = {
  desktop: 150,
  mobile: 75,
};

export const usePhysicsWorker = (coinData, timeframe, bubbleSpeed, isDesktop) => {
    const workerRef = useRef(null);
    const [bodies, setBodies] = useState([]);
    const [error, setError] = useState(null);
    const [permissionState, setPermissionState] = useState('prompt');
    const [isMotionActive, setIsMotionActive] = useState(false);
    const [isSimulationAsleep, setIsSimulationAsleep] = useState(false);
    const motionTimeout = useRef(null);
    const lastAcceleration = useRef(null);
    const lastShakeTime = useRef(0);
    const filter = useRef(new LowPassFilter(5));

    const processedCoinData = useMemo(() => {
        const limit = isDesktop ? bubbleCountLimits.desktop : bubbleCountLimits.mobile;
        const limitedData = coinData.slice(0, limit);
        return limitedData.map((coin, index) => ({ ...coin, numericId: index + 1 }));
    }, [coinData, isDesktop]);


    const handleShake = useCallback(() => {
        workerRef.current?.postMessage({ type: 'SHAKE_EVENT', payload: { intensity: 1.5 } });
    }, []);

    const handleMotionEvent = useCallback((event) => {
        if (motionTimeout.current) {
            clearTimeout(motionTimeout.current);
            motionTimeout.current = null;
        }
        const { accelerationIncludingGravity } = event;
        if (accelerationIncludingGravity) {
            let { x, y } = accelerationIncludingGravity;
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (isIOS) { x = -x; y = -y; }
            const smoothedGravity = filter.current.filter({ x, y });
            const gravityPayload = {
                x: Math.max(-1, Math.min(1, smoothedGravity.x / 9.8)),
                y: Math.max(-1, Math.min(1, smoothedGravity.y / 9.8)),
            };
            workerRef.current?.postMessage({ type: 'GRAVITY_UPDATE', payload: gravityPayload });
        }
        const { acceleration } = event;
        if (acceleration) {
            const now = Date.now();
            const SHAKE_TIMEOUT = 250;
            const SHAKE_THRESHOLD = 15;
            if (lastAcceleration.current && (now - lastShakeTime.current) > SHAKE_TIMEOUT) {
                const deltaX = Math.abs(acceleration.x - lastAcceleration.current.x);
                const deltaY = Math.abs(acceleration.y - lastAcceleration.current.y);
                const deltaZ = Math.abs(acceleration.z - lastAcceleration.current.z);
                if ((deltaX + deltaY + deltaZ) > SHAKE_THRESHOLD) {
                    lastShakeTime.current = now;
                    handleShake();
                }
            }
            lastAcceleration.current = acceleration;
        }
    }, [handleShake]);

    useEffect(() => {
        if (permissionState === 'granted' && isMotionActive) {
            motionTimeout.current = setTimeout(() => setError('Device motion events not received.'), 1500);
            window.addEventListener('devicemotion', handleMotionEvent);
            return () => {
                window.removeEventListener('devicemotion', handleMotionEvent);
                if (motionTimeout.current) clearTimeout(motionTimeout.current);
                workerRef.current?.postMessage({ type: 'GRAVITY_UPDATE', payload: { x: 0, y: 0 } });
            };
        }
    }, [permissionState, isMotionActive, handleMotionEvent]);

    const toggleMotionControls = useCallback(async () => {
        if (permissionState === 'denied') {
            alert('Motion control permission was denied. Please enable it in your browser settings.');
            return;
        }
        if (permissionState === 'prompt') {
            if (typeof window.DeviceMotionEvent?.requestPermission === 'function') {
                try {
                    const response = await window.DeviceMotionEvent.requestPermission();
                    setPermissionState(response);
                    if (response === 'granted') setIsMotionActive(true);
                } catch (e) {
                    setError('An error occurred while requesting permission.');
                    setPermissionState('denied');
                }
            } else {
                setPermissionState('granted');
                setIsMotionActive(true);
            }
        } else {
            setIsMotionActive(prev => !prev);
        }
    }, [permissionState]);

    useEffect(() => {
        const worker = new PhysicsWorker();
        workerRef.current = worker;
        worker.onmessage = (event) => {
            const { type, payload } = event.data;
            if (type === 'WORLD_STATE_UPDATE') {
                const state = new Float32Array(payload);
                const newBodies = [];
                for (let i = 0; i < state.length / 7; i++) {
                    const offset = i * 7;
                    newBodies.push({
                        id: state[offset],
                        x: state[offset + 1],
                        y: state[offset + 2],
                        radius: state[offset + 3],
                        angle: state[offset + 4],
                        dataValue: state[offset + 5],
                        isHovered: state[offset + 6] === 1,
                    });
                }
                setBodies(newBodies);
            } 
            else if (type === 'SIMULATION_ASLEEP') {
                setIsSimulationAsleep(true);
                toast('Bubbles are resting. Click Wake Up to restart!', { icon: '😴', duration: 6000 });
            } else if (type === 'SIMULATION_AWAKE') {
                setIsSimulationAsleep(false);
            }
        };
        worker.onerror = (err) => {
            console.error('Error from physics worker:', err);
            setError(err.message);
            worker.terminate();
        };
        worker.postMessage({ type: 'INIT' });
        return () => worker.terminate();
    }, []);

    const api = useMemo(() => ({
        addBodies: (bodiesToAdd) => {
            const payload = bodiesToAdd.map(body => ({ ...body, isDesktop }));
            workerRef.current?.postMessage({ type: 'ADD_BODIES', payload });
        },
        // NEW FUNCTION ADDED TO SUPPORT SMART UPDATES
        removeBodiesById: (ids) => {
             workerRef.current?.postMessage({ type: 'REMOVE_BODIES_BY_ID', payload: ids });
        },
        clearAllBodies: () => workerRef.current?.postMessage({ type: 'CLEAR_ALL_BODIES' }),
        updateBodies: (bodyUpdates) => {
            const payload = bodyUpdates.map(update => ({ ...update, isDesktop }));
            workerRef.current?.postMessage({ type: 'UPDATE_BODIES', payload });
        },
        setWalls: (width, height) => workerRef.current?.postMessage({ type: 'SET_WALLS', payload: { width, height } }),
        pointerDown: (point) => workerRef.current?.postMessage({ type: 'POINTER_DOWN', payload: { point } }),
        pointerMove: (point) => workerRef.current?.postMessage({ type: 'POINTER_MOVE', payload: { point } }),
        pointerUp: (velocity) => workerRef.current?.postMessage({ type: 'POINTER_UP', payload: { velocity } }),
        wakeUp: () => workerRef.current?.postMessage({ type: 'WAKE_UP' }),
    }), [isDesktop]);

    useEffect(() => {
        workerRef.current?.postMessage({ type: 'SET_SPEED', payload: bubbleSpeed });
    }, [bubbleSpeed]);

    return { 
        bodies, 
        api, 
        processedCoinData,
        error, 
        permissionState, 
        isMotionActive, 
        toggleMotionControls,
        isSimulationAsleep,
        wakeUp: api.wakeUp
    };
};