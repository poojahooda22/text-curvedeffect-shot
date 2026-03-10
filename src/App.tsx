import TextCurvedEffect from "./components/TextCurvedEffect";
import LandingUI from "./components/LandingUI";

function App() {
  return (
    <>
      <TextCurvedEffect
        text={"CREATIVE\nDEVELOPER"}
        fontSize={300}
        fontFamily="'Noto Sans', sans-serif"
        fontWeight="bold"
        textColor="#000000"
        backgroundColor="#ffffff"
      />
      <LandingUI />
    </>
  );
}

export default App;