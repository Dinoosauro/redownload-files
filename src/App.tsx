import 'bootstrap/dist/css/bootstrap.css'
import Header from './Components/Header'
import Button from './Components/Button'
import { useEffect, useState } from 'react'
import Checkbox from './Components/Checkbox'
interface State {
  files: null | File[],
  zipLink?: string
}
declare global {
  interface Window {
    sw: ServiceWorkerRegistration,
    ZIP: any
  }
  interface File {
    _fileLink?: string
  }
}
interface FileUrlObtain {
  for: File,
  newUrl: string,
  status?: string
}
let downloadNow = true;
let selectFolder = localStorage.getItem("RedownloadFiles-Folder") === "a";
function changeTheme() {
  document.body.setAttribute("data-bs-theme", document.body.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
  localStorage.setItem("RedownloadFiles-Theme", document.body.getAttribute("data-bs-theme") !== "dark" ? "a" : "b");
}
export default function App() {
  let [files, getFiles] = useState<State>({ files: null });
  useEffect(() => {
    new BroadcastChannel("URL").addEventListener("message", (msg) => {
      let data: FileUrlObtain = msg.data;
      if (data.status === "DownloadReady") {
        if (downloadNow) window.open(data.newUrl);
        getFiles({ ...files, zipLink: data.newUrl });
        return;
      }
      console.log(files);
      if (files.files !== null) {
        let newFiles = Array.from(files.files);
        console.log(newFiles);
        if (newFiles.findIndex(e => e.name === data.for.name && e.size === data.for.size) !== -1) {
          newFiles[newFiles.findIndex(e => e.name === data.for.name && e.size === data.for.size)]._fileLink = data.newUrl;
          console.log(newFiles[newFiles.findIndex(e => e.name === data.for.name && e.size === data.for.size)]);
          window.open(data.newUrl);
          getFiles({ ...files, files: newFiles });
        }
      }
    })
  }, [files])
  function createZipFile() {
    if (files.files !== null) {
      const readableZipStream: ReadableStream = new window.ZIP({
        start(ctrl: any) {
          if (files.files !== null) for (let item of files.files) ctrl.enqueue(item);
          ctrl.close();
        },
      });
      navigator.serviceWorker.controller?.postMessage({ action: "StreamConversion", stream: readableZipStream, size: files.files.reduce((a, b) => a + b.size, 0), url: `${window.location.origin}/zip`, name: "ExportedZip.zip" }, [readableZipStream]);
    }
  }
  console.log(files);
  return <>
    <Header></Header><br></br>
    {!files.files || files.files.length === 0 ? <>
      <Button click={() => {
        let input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        if (selectFolder) input.webkitdirectory = true;
        input.onchange = () => {
          if (input.files !== null) getFiles({ ...files, files: Array.from(input.files) })
        };
        input.click();
      }}>Select files</Button><span style={{ width: "10px", display: "inline-block" }}></span><Button type='secondary' click={changeTheme}>Change theme</Button><br></br><br></br>
      <Checkbox isChecked={localStorage.getItem("RedownloadFiles-Folder") === "a"} change={(e) => { selectFolder = e; localStorage.setItem("RedownloadFiles-Folder", e ? "a" : "b") }}>Select a folder</Checkbox>
    </> : <>
      {files.zipLink !== undefined && <div style={{ top: 0, left: 0, position: "absolute", width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px) brightness(50%)", zIndex: 2, flexDirection: "column" }}>
        <h3>Zip file ready!</h3>
        {downloadNow ?
          <><label>If you are having issues, <span style={{ textDecoration: "underline" }} onClick={() => {
            downloadNow = false;
            createZipFile();
          }}>click here</span></label>
            <div style={{ height: "20px" }}></div>
            <Button type='secondary' click={() => { getFiles({ ...files, zipLink: undefined }) }}>Close</Button>
          </> : <Button click={() => { window.open(files.zipLink); setTimeout(() => getFiles({ ...files, zipLink: undefined }), 150) }}>Download and close</Button>}
      </div>}
      <Button click={createZipFile}>Export everything as a ZIP file</Button><span style={{ width: "10px", display: "inline-block" }}></span><Button type='secondary' click={changeTheme}>Change theme</Button><br></br><br></br>
      <i>The wavy links express the items that aren't loaded by the Service Worker. You might need to click them two times (or always enable popups) to make the download start.</i>
      <br></br>
      <table className="table">
        <thead className="thread">
          <tr>
            <th scope="col"><span>#</span></th>
            <th scope="col"><span>File name</span></th>
            <th scope="col"><span>Last edit</span></th>
            <th scope="col"><span>File size (MB)</span></th>
          </tr>
        </thead>
        <tbody>
          {Array.from(files.files).map((f, i) => <tr key={`TableRow-FileList-${i}`}>
            <th scope='row'>{i + 1}</th>
            <td><a style={{ textDecoration: `underline${f._fileLink === undefined ? " wavy" : ""}` }} onClick={async () => {
              if (navigator.serviceWorker.controller !== null) {
                f._fileLink === undefined ? navigator.serviceWorker.controller.postMessage({ file: f, url: window.location.origin, id: i }) : window.open(f._fileLink);
              }
            }} download={f.name}>{(f.webkitRelativePath ?? "") !== "" ? f.webkitRelativePath : f.name}</a></td>
            <td>{new Date(f.lastModified).toLocaleString()}</td>
            <td>{(f.size / 1024 / 1024).toFixed(2)}</td>
          </tr>)}
        </tbody>
      </table>
    </>
    }<br></br><br></br><br></br>
    <i>Icon provided by Microsoft's <a href='https://github.com/microsoft/fluentui-system-icons/tree/main?tab=MIT-1-ov-file#readme' target='_blank'>Fluent UI Icons</a>. File downloading is possible thanks to <a href='https://github.com/jimmywarting/StreamSaver.js?tab=MIT-1-ov-file' target='_blank'>StreamSaver.js</a> and the "Export everything as a ZIP file" functionality is possible thanks to <a href='https://github.com/jimmywarting/StreamSaver.js/blob/master/examples/zip-stream.js' target='_blank'>zip-stream</a> library.</i>
  </>
}