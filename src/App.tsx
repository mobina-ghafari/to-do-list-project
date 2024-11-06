import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Todo from "./Todo";

const darkThem = createTheme({
  palette: {
    mode: 'dark'
  },
});

function App() {
  return (
    <ThemeProvider theme={darkThem} >
      <CssBaseline/>
        <div className="">
          <Todo/>
        </div>
    </ThemeProvider>
  );
}

export default App;
