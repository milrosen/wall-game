import './App.css';
import React, { useEffect } from 'react';
import { PythonProvider } from 'react-py';
import Game from './components/game';

function App() {
  const packages = {
    official: ['simplejson'],
  };

  useEffect(() => {
    navigator.serviceWorker
      .register('/react-py-sw.js')
      .then((registration) => console.log(
        'Service Worker registration successful with scope: ',
        registration.scope,
      ))
      .catch((err) => console.log('Service Worker registration failed: ', err));
  }, []);

  return (
    <PythonProvider packages={packages}>
      <Game />
    </PythonProvider>
  );
}

export default App;
