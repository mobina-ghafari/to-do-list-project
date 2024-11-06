import { useEffect, useState } from "react";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { status , priority , TodoItem } from "./types/types";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {createData , getStoredHashes , saveHashes , generateHash , formatEstimate , } from './functions/function';
import {
    Box,
    Typography,
    Alert,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Container,
    IconButton,
    DialogContentText,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import StatusChart from "./Chart";



// ایجاد آیتم‌های اولیه
const initialRows = [
    { id: 1, title: "Config", priority: priority.HIGH, datetime: new Date('2024-11-05T12:02:17'), status: status.DONE },
    { id: 2, title: "Menu Bar", priority: priority.LOW, datetime: new Date('2024-11-01T08:00:00'), status: status.DONE },
    { id: 3, title: "Timer", priority: priority.LOW, datetime: new Date('2024-10-01T07:02:55'), status: status.WARNING },
    { id: 4, title: "Main Navigation", priority: priority.MEDIUM, datetime: new Date('2024-09-14T17:32:06'), status: status.PENDING },
    { id: 5, title: "Mobile View Bug", priority: priority.HIGH, datetime: new Date('2024-11-04T15:02:09'), status: status.DOING },
];

// تابع برای شمارش وضعیت‌ها
const getStatusCounts = (tasks: TodoItem[]) => {
    return tasks.reduce((counts, task) => {
      counts[task.status] = (counts[task.status] || 0) + 1;
      return counts;
    }, {} as Record<status, number>);
  };

const Todo = () => {
    const [currentDate, setCurrentDate] = useState(new Date().toLocaleString());
    const [todoItem, setTodoItem] = useState<TodoItem[]>(() => {
        const savedItems = localStorage.getItem("todoItems");
        return savedItems ? JSON.parse(savedItems) : initialRows.map(item => createData(item.id, item.title, item.priority, item.datetime, item.status));
    });
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openHashDialog, setOpenHashDialog] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [inputHash, setInputHash] = useState("");
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<priority>(priority.LOW);
    const [editTodoTitle, setEditTodoTitle] = useState<string>("");
    const [editTodoPriority, setEditTodoPriority] = useState<priority>(priority.LOW);
    const [editTodoStatus, setEditTodoStatus] = useState<status>(status.PENDING);
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");
    const [searchQuery, setSearchQuery] = useState("");

    const statusCounts = getStatusCounts(todoItem); // محاسبه تعداد وضعیت‌ها



    // ذخیره وظایف در localStorage  
    useEffect(() => {
        localStorage.setItem("todoItems", JSON.stringify(todoItem));
    }, [todoItem]);


    // به‌روزرسانی زمان فعلی
    useEffect(() => {
        const timer = setInterval(() => setCurrentDate(new Date().toLocaleString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // به‌روزرسانی estimate هر ساعت
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTodoItem((prevItems) =>
                prevItems.map((item) => {
                    const hoursElapsed = Math.floor((new Date().getTime() - item.datetime.getTime()) / (1000 * 60 * 60));
                    const formattedEstimate = formatEstimate(hoursElapsed);
                    return { ...item, estimate: formattedEstimate };
                })
            );
        }, 3600000);
        return () => clearInterval(intervalId);
    }, []);


    
    // باز کردن Popup تایید حذف
    const handleDeleteClick = (id: number) => {
        setSelectedTaskId(id);
        setOpenConfirmDialog(true);
    };

    // تایید حذف و باز کردن Popup ورود hash
    const handleConfirmDelete = () => {
        setOpenConfirmDialog(false);
        setOpenHashDialog(true);
    };

    // ورود hash و اعتبارسنجی آن
    const handleHashSubmit = () => {
        const task = todoItem.find(item => item.id === selectedTaskId);
        if (task && task.hash === inputHash) {
            const updatedItems = todoItem.filter(item => item.id !== selectedTaskId);
            setTodoItem(updatedItems);
            setAlertMessage("Task successfully deleted");
    
            // ذخیره لیست جدید وظایف در localStorage
            localStorage.setItem("todoItems", JSON.stringify(updatedItems));
        } else {
            setAlertMessage("Invalid task key");
        }
        setOpenHashDialog(false);
        setSelectedTaskId(null);
        setInputHash("");
    };

    // باز کردن مودال 
    const handleAddClick = () => {
        setOpenAddDialog(true);
    };

    // افزودن آیتم جدید
    const handleAddTask = () => {
        // اضافه کردن تسک جدید
        if (newTaskTitle.trim() === "") {
            setAlertMessage("Task title cannot be empty.");
            setAlertSeverity("error");
            return;
        }
        const newId = todoItem.length + 1;
        const newTask = createData(newId, newTaskTitle, newTaskPriority, new Date(), status.PENDING);
        setTodoItem([...todoItem, newTask]);
        setAlertMessage("Task added successfully");
        setAlertSeverity("success");
        setOpenAddDialog(false);
    };

    // باز کردن مودال برای ویرایش آیتم
    const handleEditClick = (item: TodoItem) => {
        setEditTodoTitle(item.title);
        setEditTodoPriority(item.priority);
        setEditTodoStatus(item.status);
        setOpenEditDialog(true);
        setSelectedTaskId(item.id);
    };

     // ثبت تغییرات ویرایش
     const handleEditSubmit = () => {
        // ویرایش تسک
        if (editTodoTitle.trim() === "") {
            setAlertMessage("Task title cannot be empty.");
            setAlertSeverity("error");
            return;
        }
        const updatedTodo = todoItem.map((item) =>
            item.id === selectedTaskId ? { ...item, title: editTodoTitle, priority: editTodoPriority, status: editTodoStatus } : item
        );
        setTodoItem(updatedTodo);
        setAlertMessage("Task edited successfully");
        setAlertSeverity("success");
        setOpenEditDialog(false);
    };

    // تابع بازنشانی
    const handleReset = () => {
    // پاک کردن localStorage
    localStorage.removeItem("todoItems");

    // برگرداندن لیست وظایف به حالت اولیه
    setTodoItem(initialRows.map(item => createData(item.id, item.title, item.priority, item.datetime, item.status)));
    setAlertMessage("Tasks reset to default");
    setAlertSeverity("success");
};

const filteredItems = todoItem.filter((item) => {
    return (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.estimate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
});




    return (
        <Container maxWidth="lg" sx={{
            display:"flex",
            alignItemsa: "center",
            justifyContent: "center",
            flexDirection: "column"
        }}>
            <Typography variant="h3" sx={{ mt: 3 , textAlign:"center" }}>To-Do List</Typography>
            {/* نمایش نمودار وضعیت‌ها */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                <StatusChart statusCounts={statusCounts} />
            </Box>
            <Box sx={{  display: "flex" , alignItems:"center" , justifyContent: "space-between" }}>
                <AddCircleOutlineIcon fontSize="large" color="primary" onClick={handleAddClick} />
                <Box sx={{display: "flex", alignItems:"center"}}>
                    <Typography sx={{ marginRight: 1 }}>{currentDate}</Typography>
                    <AccessTimeIcon fontSize="large" color="primary" />
                </Box>
            </Box>
            <TextField
                sx={{mt:6}}
                label="Search"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, priority, estimate, or status"
            />

            <TableContainer component={Paper} sx={{ mt: 1 }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: "#90caf9" }}>Title</TableCell>
                            <TableCell align="center" sx={{ color: "#90caf9" }}>Priority</TableCell>
                            <TableCell align="center" sx={{ color: "#90caf9" }}>Date Time</TableCell>
                            <TableCell align="center" sx={{ color: "#90caf9" }}>Estimate</TableCell>
                            <TableCell align="center" sx={{ color: "#90caf9" }}>Status</TableCell>
                            <TableCell align="center" sx={{ color: "#90caf9" }}>Edit / Delete</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredItems.map((row) => (
                            <TableRow hover key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">{row.title}</TableCell>
                                <TableCell align="center">{row.priority}</TableCell>
                                <TableCell align="center">{row.datetime.toLocaleString()}</TableCell>
                                <TableCell align="center">{row.estimate}</TableCell>
                                <TableCell align="center">{row.status}</TableCell>
                                <TableCell align="center">
                                    <IconButton edge="end" onClick={() => handleEditClick(row)}
                                    sx={{ "&:hover": { backgroundColor: "transparent", color: "#90caf9" } }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" onClick={() => handleDeleteClick(row.id)}
                                        sx={{ "&:hover": { backgroundColor: "transparent", color: "#90caf9" } }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <Button variant="outlined" color="primary" onClick={handleReset}>
                    Reset to Default
                </Button>
            </Box>
            {/* Popup تایید حذف */}
            <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this task?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="primary">Delete</Button>
                </DialogActions>
            </Dialog>
            {/* Popup ورود hash */}
            <Dialog open={openHashDialog} onClose={() => setOpenHashDialog(false)}>
                <DialogTitle>Enter Task Key</DialogTitle>
                <DialogContent>
                    <DialogContentText>To delete the task, please enter the unique task key.</DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Task Key"
                        fullWidth
                        variant="outlined"
                        value={inputHash}
                        onChange={(e) => setInputHash(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHashDialog(false)}>Cancel</Button>
                    <Button onClick={handleHashSubmit} color="primary">Submit</Button>
                </DialogActions>
            </Dialog>
            {/* Dialog برای افزودن تسک جدید */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Task Title"
                        fullWidth
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={newTaskPriority}
                            label="Priority"
                            onChange={(e) => setNewTaskPriority(e.target.value as priority)}
                        >
                            <MenuItem value={priority.LOW}>Low</MenuItem>
                            <MenuItem value={priority.MEDIUM}>Medium</MenuItem>
                            <MenuItem value={priority.HIGH}>High</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddTask} color="primary">Add</Button>
                </DialogActions>
            </Dialog>
            {/* مودال ویرایش آیتم */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>Edit Todo</DialogTitle>
                <DialogContent>
                    <TextField
                        sx={{mt:4}}
                        label="Title"
                        fullWidth
                        value={editTodoTitle}
                        onChange={(e) => setEditTodoTitle(e.target.value)}
                    />

                    {/* فیلد Priority */}
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={editTodoPriority}
                            label="Priority"
                            onChange={(e) => setEditTodoPriority(e.target.value as priority)}
                        >
                            <MenuItem value={priority.LOW}>Low</MenuItem>
                            <MenuItem value={priority.MEDIUM}>Medium</MenuItem>
                            <MenuItem value={priority.HIGH}>High</MenuItem>
                        </Select>
                    </FormControl>

                    {/* فیلد Status */}
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={editTodoStatus}
                            label="Status"
                            onChange={(e) => setEditTodoStatus(e.target.value as status)}
                        >
                            <MenuItem value={status.PENDING}>Pending</MenuItem>
                            <MenuItem value={status.DOING}>Doing</MenuItem>
                            <MenuItem value={status.DONE}>Done</MenuItem>
                            <MenuItem value={status.WARNING}>Warning</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)} color="primary">Cancel</Button>
                    <Button onClick={handleEditSubmit} color="primary">Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar برای نمایش پیغام موفقیت یا خطا */}
            <Snackbar open={!!alertMessage} autoHideDuration={4000} onClose={() => setAlertMessage(null)}>
                <Alert onClose={() => setAlertMessage(null)} severity="info">
                    {alertMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Todo;
