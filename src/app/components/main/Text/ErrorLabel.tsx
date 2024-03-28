export default function ErrorLabel(props : {error : unknown| string | undefined}){
    return <p>{props.error ?? props.error}</p>
}