import 'bootstrap/dist/css/bootstrap.css'
import Header from './Components/Header'
import Button from './Components/Button'
import { useState } from 'react'
import Checkbox from './Components/Checkbox'
interface State {
  files: null | FileList,
}
declare global {
  interface Window {
    streamSaver: {
      createWriteStream: (name: string, options?: {
        size: number
      }) => WritableStream,
      WritableStream: WritableStream,
      supported: boolean,
      mitm: string
    },
    ZIP: any
  }
}
caches.open("sw-streamsaver-cache").then((cache) => cache.addAll([`${window.location.origin}/${window.location.origin.indexOf("github") !== -1 ? "/redownload-files" : ""}/streamSaver/mitm.html?version=2.0.0`, `${window.location.origin}/${window.location.origin.indexOf("github") !== -1 ? "/redownload-files" : ""}/streamSaver/sw.js`]))
let selectFolder = localStorage.getItem("RedownloadFiles-Folder") === "a";
function changeTheme() {
  document.body.setAttribute("data-bs-theme", document.body.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
  localStorage.setItem("RedownloadFiles-Theme", document.body.getAttribute("data-bs-theme") !== "dark" ? "a" : "b");
}
window.streamSaver.mitm = `${window.location.origin}/streamSaver/mitm.html?version=2.0.0`;
export default function App() {
  let [files, getFiles] = useState<State>({ files: null });
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
          getFiles({ ...files, files: input.files })
        };
        input.click();
      }}>Select files</Button><span style={{ width: "10px", display: "inline-block" }}></span><Button type='secondary' click={changeTheme}>Change theme</Button><br></br><br></br>
      <Checkbox isChecked={localStorage.getItem("RedownloadFiles-Folder") === "a"} change={(e) => { selectFolder = e; localStorage.setItem("RedownloadFiles-Folder", e ? "a" : "b") }}>Select a folder</Checkbox>
    </> : <>
      <Button click={async () => {
        if (files.files !== null) {
          const fileStream = window.streamSaver.createWriteStream("Redownload-Files.zip", { size: Array.from(files.files).reduce((a, b) => a + b.size, 0) });
          const readableZipStream = new window.ZIP({
            start(ctrl: any) {
              if (files.files !== null) for (let item of files.files) ctrl.enqueue(item);
              ctrl.close();
            },
          });
          readableZipStream.pipeTo(fileStream);
        }
      }}>Export everything as a ZIP file</Button><span style={{ width: "10px", display: "inline-block" }}></span><Button type='secondary' click={changeTheme}>Change theme</Button><br></br><br></br>
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
            <td><a style={{ textDecoration: "underline" }} onClick={async () => {
              if (window.streamSaver !== undefined) {

                const fileStream = window.streamSaver.createWriteStream(f.name, { size: f.size });
                f.stream().pipeTo(fileStream);
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