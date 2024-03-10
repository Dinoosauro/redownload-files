interface Props {
    update: (e: any) => void,
    hint: string,
    defaultVal: string
}
export default function Input({ update, hint, defaultVal }: Props) {
    return <div className="input-group mb-3">
        <span className="input-group-text">{hint}</span>
        <input type="text" className="form-control" defaultValue={defaultVal} onInput={(e) => { update((e.target as HTMLInputElement).value) }}></input>
    </div>
}