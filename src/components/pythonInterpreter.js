import React, { useEffect } from 'react';
import { usePython } from 'react-py';

const mainCode = `import randomController
import simplejson as json
print("hello world")    
print(input("please"))`;

const randomControllerCode = `class RandomController:
    def move(state):
        return state.currentTurn`;

export default function PythonInterpreter() {
//   const [input, setInput] = useState('');
  const {
    runPython, stdout, stderr, isLoading, isRunning, prompt,
    writeFile, watchModules, sendInput, isAwaitingInput,
  } = usePython();

  useEffect(() => {
    watchModules(['randomController']);
  }, []);

  function run() {
    writeFile('randomController.py', randomControllerCode);
    runPython(mainCode);
  }

  return (
    <div>
      {isAwaitingInput && <button onClick={sendInput('hello!')} aria-label="hellobtn" type="submit">InputBttn</button>}
      <button
        onClick={() => {
          if (isLoading) {
            console.log('loading');
            return;
          }
          run();
        }}
        aria-label="start"
        type="submit"
      />
      {stdout}
      {isLoading}
      {isRunning}
      ,
      {prompt}
      {stderr}
    </div>
  );
}
