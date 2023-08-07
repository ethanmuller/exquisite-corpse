import "react";

function Buttons(props) {
  return (
    <div>
      <span className="sp">
        <button onClick={props.onUndo} disabled={props.strokes.length === 0}>
          Undo
        </button>
      </span>
      <span className="sp">
        <button
          onClick={props.onDone}
          className="btn__primary"
          disabled={props.strokes.length === 0}
        >
          All Done
        </button>
      </span>
    </div>
  );
}

export function Controls(props) {
  return <>{props.isThisPartOver ? <></> : <Buttons {...props} />}</>;
}
