
const NoDataCard = ({ title, message }) => {
    return (
        <>
           <div className="flex items-center justify-center">
           <div className="flex flex-col items-center justify-center bg-transparent border-red-500 border rounded-3xl p-6">
                <h1 className="text-3xl text-danger font-bold">{title}</h1>
                <p className="text-gray-500">{message}</p>
            </div>
           </div>
        </>
    )
}

export default NoDataCard