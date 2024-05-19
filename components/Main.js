"use client";
import { DriveURL } from "@/data/data";
import {
  Container,
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Alert,
  AlertTitle,
  LinearProgress,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
const RANGE = "Sheet1!A:B";
const Main = () => {
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  useEffect(() => {
    if (alert.visible) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setAlert({ ...alert, visible: false });
            return 0;
          }
          return prev + 20;
        });
      }, 400);

      return () => clearInterval(timer);
    }
  }, [alert.visible]);

  const fetchSheetData = async () => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${GOOGLE_API_KEY}`;

    try {
      const response = await axios.get(url);
      const data = response.data.values;
      const passwordExists = data.some((row) => row[1] === password);
      if (passwordExists) {
        setAlert({
          type: "success",
          message: "Login Successful!",
          visible: true,
        });
        window.open(DriveURL, "_blank"), setPassword("");
      } else {
        setAlert({
          type: "error",
          message: "Incorrect Password!",
          visible: true,
        });
        setPassword("");
      }
    } catch (error) {
      console.error("Error fetching data from Google Sheets API", error);
    }
  };

  const handleLogin = () => {
    fetchSheetData();
  };

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Card sx={{ minWidth: "50%" }} elevation={6}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Outer Card
          </Typography>
          <Card sx={{ mt: 2, p: 2 }}>
            <TextField
              required
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <Button
              variant="contained"
              color="warning"
              sx={{ mt: 2, width: "100%" }}
              onClick={handleLogin}
            >
              Login
            </Button>
            {alert.visible && (
              <>
                <Alert severity={alert.type} sx={{ mt: 2 }}>
                  <AlertTitle>
                    {alert.type === "success" ? "Success" : "Error"}
                  </AlertTitle>
                  {alert.message}
                </Alert>
                <LinearProgress
                  variant="determinate"
                  color={alert.type === "success" ? "success" : "error"}
                  value={progress}
                  sx={{ mt: 0 }}
                />
              </>
            )}
          </Card>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Main;
