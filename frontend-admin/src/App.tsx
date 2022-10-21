import Header from 'components/Header/Header';

function App() {
  return (
    <div className="flex flex-column min-h-screen surface-ground">
      <Header />
      <div className="flex flex-auto flex-column p-5">
        <div className="border-round flex-auto surface-border surface-section"></div>
      </div>
    </div>
  );
}

export default App;
