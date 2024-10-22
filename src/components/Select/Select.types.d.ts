export interface SelectOption {
    id: string
    label: string
    value: string
}
export interface SelectProps {
    options: SelectOption[]
    className?: string
}
