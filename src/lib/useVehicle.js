import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getVehicle } from '../api/mockApi';
import { useAppState } from '../context/AppState.jsx';

/** Vehicle from the URL (/vehicle/:id), otherwise the last car viewed. */
export function useVehicle() {
  const { id } = useParams();
  const { lastCar, setLastCar } = useAppState();
  const car = getVehicle(id || lastCar);
  useEffect(() => {
    if (car && car.id !== lastCar) setLastCar(car.id);
  }, [car, lastCar, setLastCar]);
  return car;
}
