import 'bootstrap/dist/css/bootstrap.css'
import Header from './Components/Header'
import Button from './Components/Button'
import { useState } from 'react'
import JSZip from 'jszip'
import Checkbox from './Components/Checkbox'
interface State {
  files: null | FileList,
  showZipProgress: number,
  zipUrl?: string
}
let selectFolder = false;
let revokeZipUrl = false;
function changeTheme() {
  document.body.setAttribute("data-bs-theme", document.body.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
  localStorage.setItem("RedownloadFiles-Theme", document.body.getAttribute("data-bs-theme") !== "dark" ? "a" : "b");
}
export default function App() {
  let [files, getFiles] = useState<State>({ files: null, showZipProgress: -1 });
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
      <Checkbox change={(e) => { selectFolder = e }}>Select a folder</Checkbox>
    </> : <>
      {files.showZipProgress !== -1 && <div style={{ zIndex: 2, backdropFilter: "blur(8px) brightness(50%)", display: "flex", alignItems: "center", justifyContent: "center", width: "100vw", height: "100vh", top: 0, left: 0, position: 'absolute' }}>
        {files.zipUrl !== undefined ? <>
          <div style={{ padding: "20px" }}>
            <h3>Zip file ready!</h3>
            <a href={files.zipUrl} download={"Redownload-Files.zip"}>Click here to download it.</a><br></br><br></br>
            <Button click={() => { if (files.zipUrl !== undefined && revokeZipUrl) URL.revokeObjectURL(files.zipUrl); getFiles({ ...files, showZipProgress: -1, zipUrl: undefined }) }}>Close this</Button><br></br>
            <br></br><br></br><Checkbox change={(e) => { revokeZipUrl = e }}>Revoke object URL (do this only if the download has finished)</Checkbox>
          </div>
        </> : files.showZipProgress === -2 ? <label>Creating final zip file...</label> : <label>Adding file {files.showZipProgress} ({files.files[files.showZipProgress].name})</label>}
      </div>
      }
      <Button click={async () => {
        let zip = new JSZip();
        if (files.files !== null) for (let i = 0; i < files.files.length; i++) {
          getFiles({ ...files, showZipProgress: i });
          await zip.file((files.files[i].webkitRelativePath ?? "") !== "" ? files.files[i].webkitRelativePath : files.files[i].name, await files.files[i].arrayBuffer());
        };
        getFiles({ ...files, showZipProgress: -2 });
        let blob = await zip.generateAsync({ type: "blob" })
        getFiles({ ...files, zipUrl: URL.createObjectURL(blob), showZipProgress: -2 });
      }}>Export everything as a ZIP file</Button><span style={{ width: "10px", display: "inline-block" }}></span><Button type='secondary' click={changeTheme}>Change theme</Button><br></br><br></br>
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
            <td><a style={{ textDecoration: "underline" }} onClick={async (e) => {
              if ((e.currentTarget.href ?? "") === "") e.currentTarget.href = URL.createObjectURL(new Blob([await f.arrayBuffer()], { type: f.type }));
            }} download={f.name}>{(f.webkitRelativePath ?? "") !== "" ? f.webkitRelativePath : f.name}</a></td>
            <td>{f.lastModified}</td>
            <td>{(f.size / 1024 / 1024).toFixed(2)}</td>
          </tr>)}
        </tbody>
      </table>
    </>
    }<br></br><br></br><br></br>
    <i>Icon provided by Microsoft's <a href='https://github.com/microsoft/fluentui-system-icons/tree/main?tab=MIT-1-ov-file#readme' target='_blank'>Fluent UI Icons.</a> The usage of the "Export everything as a ZIP File" functionality uses the open-source <a href='https://github.com/Stuk/jszip?tab=License-1-ov-file#readme' target='_blank'>JSZip Library.</a></i>
  </>
}