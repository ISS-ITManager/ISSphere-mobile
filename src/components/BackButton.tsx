import { useHistory } from "react-router"

const BackButton = () => {
    const history = useHistory();

    const handleBackClick = () => {
        history.goBack();
    }
    return (
        <>

            <button className='btn mt-2 btn-outline-primary
            btn-sm mt-1 rounded-pill' onClick={handleBackClick}>
                <i className='bx bx-chevron-left' ></i> Back
            </button>
        </>
    )
}
export default BackButton;