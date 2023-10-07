import React, { useEffect, useState } from 'react';
import Peer from 'peerjs';
import './App.css';

function App() {
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState('');
  const [connected, setConnected] = useState(false);
  const [conn, setConn] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [receivedFile, setReceivedFile] = useState(null);

  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      setPeerId(id);
    });

    newPeer.on('connection', (connection) => {
      console.log('Someone connected');
      setConn(connection);

      connection.on('open', () => {
        console.log('Connected to a peer');
        setConnected(true);
      });

      connection.on('data', (data) => {
        if (data.data instanceof ArrayBuffer && data.name && data.type) {
          console.log('Received file:', data);
          const receivedBlob = new Blob([data.data], { type: data.type });
          setReceivedFile(receivedBlob);
        } else {
          console.log('Received data:', data);
        }
      });
    });

    return () => {
      newPeer.destroy();
    };
  }, []);

  const handlePeerIdChange = (event) => {
    setPeerId(event.target.value);
  };

  const connect = () => {
    if (peer) {
      const connection = peer.connect(peerId);

      connection.on('open', () => {
        console.log('Connected to peer', peerId);
        setConn(connection);
        setConnected(true);
      });
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const sendFile = () => {
    if (conn && selectedFile) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileData = event.target.result;
        const fileInfo = {
          data: fileData,
          name: selectedFile.name,
          type: selectedFile.type,
        };
        conn.send(fileInfo);
      };

      reader.readAsArrayBuffer(selectedFile);
    } else {
      console.log('Invalid file format');
    }
  };

  return (
    <div className="App">
      <h1>Peer To Peer Authentication</h1>
      <div>
        <div className="peer-id">
          <p>Your key :</p>
          <p>{peer ? peer.id : 'Loading...'}</p>
        </div>
        <input
          type="text"
          placeholder="Enter Peer's Key ID"
          onChange={handlePeerIdChange}
        />
        <button onClick={connect}>Connect</button>
      </div>
      <div>
        {connected ? (
          <div>
            <p>Connected to a peer!</p>
            
            <input type="file" onChange={handleFileChange} />
            <button onClick={sendFile}>Send File</button>
            {receivedFile && (
              <div>
                <p>Received File:</p>
                <a href={URL.createObjectURL(receivedFile)} download={receivedFile.name}>
                  Download File
                </a>
              </div>
            )}
          </div>
        ) : (
          <p>Not connected to any peer yet</p>
        )}
      </div>
    </div>
  );
}

export default App;
