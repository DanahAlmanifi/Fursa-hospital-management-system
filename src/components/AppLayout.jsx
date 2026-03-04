import "../components/Sidebar.css"
import "../App.css"
import Sidebar from "./Sidebar"

export default function AppLayout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-content">
                <main className="page-main">
                    {children}
                </main>
            </div>
        </div>
    )
}
