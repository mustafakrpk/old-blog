import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"
import HomeAuthRoute from "./routes/HomeAuthRoute"

const router = createBrowserRouter([
	{
		path: "/",
		element: <HomeAuthRoute />,
	},
	{
		path: "*",
		element: <HomeAuthRoute />,
	},
])

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
)
