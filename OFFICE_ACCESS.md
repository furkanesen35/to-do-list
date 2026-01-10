# Office Todo List - Access Instructions

## PM2 Management Commands

### Check app status:
```
pm2 status
```

### View logs:
```
pm2 logs office-todo-list
```

### Restart app:
```
pm2 restart office-todo-list
```

### Stop app:
```
pm2 stop office-todo-list
```

### Start app:
```
pm2 start ecosystem.config.js
```

## Access URLs

### Current IP Access:
- **Main URL**: http://192.168.178.22:3000
- **API**: http://192.168.178.22:3000/api

### For Windows Startup (Auto-start on boot):

1. Press `Win + R`, type `shell:startup`, press Enter
2. Create a shortcut to: `C:\Users\furkan\Desktop\projects\to-do-list\start-pm2.bat`
3. App will auto-start when Windows boots

## Setup Friendly URL for Office

### Option 1: Router DNS (Recommended)
1. Access your router admin panel (usually http://192.168.178.1)
2. Find DNS settings or "Local DNS" / "Static DNS"
3. Add entry: `todo.office` → `192.168.178.22`
4. Colleagues can access: **http://todo.office:3000**

### Option 2: Windows Hosts File (Each PC)
Have each colleague edit their hosts file:

**Location**: `C:\Windows\System32\drivers\etc\hosts` (as Administrator)

**Add this line**:
```
192.168.178.22    todo.office
```

**Access**: http://todo.office:3000

### Option 3: Port 80 (Remove :3000 from URL)
To make it just `http://todo.office`:

1. Install nginx or use IIS as reverse proxy
2. Forward port 80 → 3000
3. Or change Next.js port to 80 (requires admin privileges)

## Database Info
- **Host**: 192.168.178.42 (Ubuntu VirtualBox)
- **Port**: 5432
- **Database**: todo_list_db
- **User**: backend_user
