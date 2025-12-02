
export interface MenuItem {
    icon:string,
    action:(event:PointerEvent) => void,
    tooltip:string
    label:string
    route:string
    end?:boolean
}