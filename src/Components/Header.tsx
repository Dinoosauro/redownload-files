export default function Header() {
    let img = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${getComputedStyle(document.body).getPropertyValue("--bs-primary")}" d="M20.496 5.627A2.25 2.25 0 0 1 22 7.75v10A4.25 4.25 0 0 1 17.75 22h-10a2.25 2.25 0 0 1-2.123-1.504l2.097.004H17.75a2.75 2.75 0 0 0 2.75-2.75v-10l-.004-.051V5.627ZM17.246 2a2.25 2.25 0 0 1 2.25 2.25v12.997a2.25 2.25 0 0 1-2.25 2.25H4.25A2.25 2.25 0 0 1 2 17.247V4.25A2.25 2.25 0 0 1 4.25 2h12.997ZM10.75 6.75a.75.75 0 0 0-.743.648L10 7.5V10H7.5a.75.75 0 0 0-.102 1.493l.102.007H10V14a.75.75 0 0 0 1.493.102L11.5 14v-2.5H14a.75.75 0 0 0 .102-1.493L14 10h-2.5V7.5a.75.75 0 0 0-.75-.75Z"/></svg>`;
    return <>
        <div style={{ display: "flex", alignItems: "center" }}>
            <img width={48} height={48} style={{ marginRight: "10px" }} src={URL.createObjectURL(new Blob([img], { type: "image/svg+xml" }))}></img>
            <h2 style={{ margin: "0px" }}>ReDownload Files</h2>
        </div><br></br>
        <i>Redownload the selected files, also as a ZIP file</i><br></br><br></br>
    </>
}