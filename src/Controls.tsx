import "react";

function Buttons(props) {
  return (
    <div>
      <span className="sp"><button onClick={props.onClear}>Clear</button></span>
      <span className="sp"><button onClick={props.onDone} className='btn__primary'>All Done</button></span>
    </div>
  );
}

export function Controls(props) {
  return (
    <>
      {props.isThisPartOver ? (
        <></>
      ) : (
        <Buttons {...props} />
      )}
    </>
  );
}
