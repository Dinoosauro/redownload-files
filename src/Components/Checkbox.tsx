import { ReactNode } from "react"

interface Props {
    change?: (changed: boolean) => void,
    children: ReactNode,
    isChecked?: boolean
}
export default function Checkbox({ change, children, isChecked }: Props) {
    return <div className="form-check">
        <input className="form-check-input" type="checkbox" defaultChecked={isChecked} value="" onChange={(e) => { if (change !== undefined) change(e.target.checked) }}></input>
        <label className="form-check-label">
            {children}
        </label>
    </div>
}