# IntelliJ IDEA Configuration Fix

## Problem
IntelliJ IDEA is using JDK 24 which is incompatible with this project. The project requires Java 17.

## Solution

### Step 1: Configure Project SDK in IntelliJ

1. Open **File → Project Structure** (or press `Ctrl+Alt+Shift+S`)
2. Under **Project Settings → Project**:
   - **SDK**: Select "17" or "corretto-17" or "temurin-17" (or download it if not available)
   - **Language level**: Select "17 - Sealed types, always-strict floating-point semantics"
3. Click **Apply**

### Step 2: Configure Module SDK

1. In the same **Project Structure** window, go to **Modules**
2. Select the **inventory-management** module
3. In the **Sources** tab:
   - **Language level**: Select "17"
4. In the **Dependencies** tab:
   - **Module SDK**: Select "Project SDK 17"
5. Click **Apply** then **OK**

### Step 3: Configure Java Compiler

1. Open **File → Settings** (or press `Ctrl+Alt+S`)
2. Navigate to **Build, Execution, Deployment → Compiler → Java Compiler**
3. Under **Per-module bytecode version**:
   - **Target bytecode version** for inventory-management: Select "17"
4. Click **Apply** then **OK**

### Step 4: Rebuild Project

1. Go to **Build → Rebuild Project** (or press `Ctrl+Shift+F9`)
2. Or use Maven: Open Maven tool window → Lifecycle → clean → compile

### Step 5: If Still Failing

**Option A: Invalidate Caches**
1. **File → Invalidate Caches...**
2. Check all options:
   - Clear file system cache and Local History
   - Clear VCS Log caches and indexes
   - Clear downloaded shared indexes
   - Clear SDK table
3. Click **Invalidate and Restart**

**Option B: Delete IDE Configuration**
1. Close IntelliJ IDEA
2. Delete the `.idea` folder from the backend directory
3. Reopen the project in IntelliJ (it will reimport from pom.xml)

**Option C: Use Maven from Command Line**
```bash
cd backend
./mvnw clean compile
```

## Verification

After configuration, verify:
- **File → Project Structure → Project**: Should show SDK 17
- Run `java -version` in terminal: Should show "java version 17.x.x"
- Build should succeed without `ExceptionInInitializerError`

## Important Notes

- **DO NOT use JDK 24** - It's too new and incompatible with Spring Boot 3.1.6
- **JDK 17 is the LTS (Long Term Support) version** - Use this for stability
- **If you only have JDK 24 installed**, download JDK 17 from:
  - https://adoptium.net/temurin/releases/?version=17
  - https://aws.amazon.com/corretto/
  - Or use IntelliJ's built-in JDK downloader in Project Structure

## Troubleshooting

If you still see errors:

1. **Check Maven settings**:
   - **File → Settings → Build, Execution, Deployment → Build Tools → Maven**
   - **Maven home path**: Should point to the bundled Maven or your installation
   - **User settings file**: Check if it exists

2. **Check Annotation Processors**:
   - **File → Settings → Build, Execution, Deployment → Annotation Processors**
   - **Enable annotation processing**: Should be checked
   - **Obtain processors from project classpath**: Should be selected

3. **Delete all generated folders**:
   ```bash
   cd backend
   rm -rf target
   rm -rf .idea/libraries
   ```

4. **Reimport Maven project**:
   - Right-click on `pom.xml` → **Maven → Reload Project**
