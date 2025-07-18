const LinesBtn = ({ toggleVisiblity }: { toggleVisiblity: () => void }) => {
  return (
    <div className="clickeable" onClick={toggleVisiblity}>
      <svg
        className="lines-svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.33325 14.6667H21.3333V17.3333H5.33325V14.6667ZM5.33325 8H26.6666V10.6667H5.33325V8ZM5.33325 24H14.9799V21.3333H5.33325V24Z"
          fill="#202020"
        />
      </svg>
    </div>
  );
};

export default LinesBtn;
