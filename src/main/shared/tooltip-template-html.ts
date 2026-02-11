export const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin:0;padding:0;background:transparent;width:100%;height:100%;overflow:hidden;">
  <div id="tooltip" style="background:#E1EAF3;color:#000000;padding:6px 10px;margin:0;white-space:nowrap;font:12px system-ui,-apple-system,sans-serif;border-radius:4px;box-shadow:0 0 3px rgba(0,0,0,0.2);line-height:16px;display:inline-block;max-width:none;">Loading...</div>
  <script>
    // Force styles immediately
    document.body.style.backgroundColor = 'transparent';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    
    const el = document.getElementById('tooltip');
    el.style.backgroundColor = '#E1EAF3';
    el.style.color = '#000000';
    el.style.padding = '6px 10px';
    el.style.margin = '0';
    el.style.borderRadius = '4px';
    el.style.whiteSpace = 'nowrap';
    el.style.font = '12px system-ui, -apple-system, sans-serif';
    el.style.lineHeight = '16px';
    el.style.boxShadow = '0 0 3px rgba(0,0,0,0.2)';
    el.style.display = 'inline-block';
    el.style.maxWidth = 'none';
    
    const { ipcRenderer } = require('electron');
    
    ipcRenderer.on('tooltip:set-text', (_event, text) => {
        // Set text
        el.textContent = text || 'Empty';
        
        // Force styles again after setting text
        el.style.backgroundColor = '#E1EAF3';
        el.style.color = '#000000';
        el.style.borderRadius = '4px';
        el.style.boxShadow = '0 0 3px rgba(0,0,0,0.2)';
        el.style.lineHeight = '16px';
        el.style.display = 'inline-block';
        document.body.style.backgroundColor = 'transparent';
        document.body.style.overflow = 'hidden';
        
        // Calculate size dynamically based on content
        setTimeout(() => {
          // Reset styles for measurement
          el.style.whiteSpace = 'nowrap';
          el.style.maxWidth = 'none';
          el.style.width = 'auto';
          
          // Get natural dimensions
          const naturalRect = el.getBoundingClientRect();
          let finalWidth = naturalRect.width;
          let finalHeight = naturalRect.height;
          
          // Define maximum width (40% of screen width, min 300px, max 600px)
          const screenWidth = window.screen.width;
          const maxWidth = Math.min(Math.max(screenWidth * 0.4, 300), 600);
          
          // If text is too wide, enable wrapping
          if (finalWidth > maxWidth) {
            el.style.whiteSpace = 'normal';
            el.style.wordWrap = 'break-word';
            el.style.wordBreak = 'break-word';
            el.style.maxWidth = maxWidth + 'px';
            el.style.width = maxWidth + 'px';
            
            // Force reflow and get new dimensions
            el.offsetHeight; // Force reflow
            const wrappedRect = el.getBoundingClientRect();
            finalWidth = wrappedRect.width;
            finalHeight = wrappedRect.height;
          }
          
          // Add some padding to the calculated dimensions
          const paddingX = 8; // Extra horizontal padding
          const paddingY = 4; // Extra vertical padding
          
          const totalWidth = Math.ceil(finalWidth + paddingX);
          const totalHeight = Math.ceil(finalHeight + paddingY);
          
          // Set minimum and maximum dimensions
          const minWidth = 200;
          const minHeight = 50;
          const maxTooltipWidth = 800;
          const maxTooltipHeight = 400;
          
          const constrainedWidth = Math.max(minWidth, Math.min(totalWidth, maxTooltipWidth));
          const constrainedHeight = Math.max(minHeight, Math.min(totalHeight, maxTooltipHeight));
          
          ipcRenderer.send('tooltip:resize', { 
            width: constrainedWidth, 
            height: constrainedHeight 
          });
        }, 15); // Slightly longer delay for better measurement
      });
  </script>
</body>
</html>`;