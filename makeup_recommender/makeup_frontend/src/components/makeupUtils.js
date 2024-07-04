// Utility functions for managing makeup overlays

export const createMakeupOverlay = (container, type, properties) => {
    let overlay;

    console.log(`Creating overlay: Type: ${type}, Properties:`, properties);

    if ((type === 'lipstick' || type === 'lip_liner') && properties.pathD) {
        overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        overlay.setAttribute('class', `makeup-overlay ${type}`);
        overlay.setAttribute('style', 'position: absolute; overflow: visible; z-index: 10;');

        // Make sure the SVG element matches the size of the video container
        overlay.setAttribute('width', properties.width);
        overlay.setAttribute('height', properties.height);

        // Create the viewbox based on video dimensions to match the coordinate system
        overlay.setAttribute('viewBox', `0 0 ${properties.width} ${properties.height}`);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', properties.pathD);

        // Set fill for lipstick and stroke for lip liner
        if (type === 'lipstick') {
            path.setAttribute('fill', properties.color);
            path.setAttribute('fill-opacity', properties.opacity);
        } else if (type === 'lip_liner') {
            path.setAttribute('stroke', properties.color);
            path.setAttribute('stroke-width', '2'); // Set the stroke width for the lip liner
            path.setAttribute('fill', 'none'); // No fill for lip liner
            path.setAttribute('stroke-opacity', properties.opacity);
        }

        overlay.appendChild(path);

    } else if (type === 'blush' && properties.cheeks) {
        // Create an SVG container element
        const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgContainer.setAttribute('style', 'position: absolute; overflow: visible; z-index: 2000;');
        svgContainer.setAttribute('width', properties.width);
        svgContainer.setAttribute('height', properties.height);
        svgContainer.setAttribute('viewBox', `0 0 ${properties.width} ${properties.height}`);

        // Define the radial gradient
        const gradId = 'blush-gradient';
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        gradient.setAttribute('id', gradId);

        // Create the gradient stops for the inner color and the outer color (fade out)
        const startStop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        startStop.setAttribute('offset', '30%'); // Inner color at 30%
        startStop.setAttribute('stop-color', properties.color);
        startStop.setAttribute('stop-opacity', properties.opacity); // Fully opaque

        const endStop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        endStop.setAttribute('offset', '100%'); // Outer edge
        endStop.setAttribute('stop-color', properties.color);
        endStop.setAttribute('stop-opacity', '0'); // Fully transparent

        gradient.appendChild(startStop);
        gradient.appendChild(endStop);

        // Append the gradient to the SVG container
        svgContainer.appendChild(gradient);
        
        // Code to create blush overlays for both cheeks
        Object.values(properties.cheeks).forEach(cheek => {
            console.log('Creating overlay:', cheek);
    
            let overlay = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            overlay.setAttribute('class', `makeup-overlay ${type}`);
            
            overlay.setAttribute('cx', cheek.x.toString());
            overlay.setAttribute('cy', cheek.y.toString());
            overlay.setAttribute('rx', (cheek.width / 2).toString());
            overlay.setAttribute('ry', (cheek.height / 2).toString());
            overlay.setAttribute('fill', `url(#${gradId})`); // Apply the gradient here
    
            // Append the ellipse to the SVG container
            svgContainer.appendChild(overlay);
        });
    
        // Append the SVG container to the container element
        container.appendChild(svgContainer);
        console.log('SVG container:', svgContainer.outerHTML);
    
        return svgContainer;
    } else if (type === 'bronzer' && properties.bronzerAreas) {
        const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgContainer.setAttribute('style', 'position: absolute; overflow: visible; z-index: 2000;');
        svgContainer.setAttribute('width', properties.width);
        svgContainer.setAttribute('height', properties.height);
        svgContainer.setAttribute('viewBox', `0 0 ${properties.width} ${properties.height}`);
    
        const gradId = 'bronzer-gradient';
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        gradient.setAttribute('id', gradId);
        
        // Create the gradient stops for the inner color and the outer color (fade out)
        const startStop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        startStop.setAttribute('offset', '30%'); // Inner color at 30%
        startStop.setAttribute('stop-color', properties.color);
        startStop.setAttribute('stop-opacity', properties.opacity); // Fully opaque

        const endStop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        endStop.setAttribute('offset', '100%'); // Outer edge
        endStop.setAttribute('stop-color', properties.color);
        endStop.setAttribute('stop-opacity', '0'); // Fully transparent

        gradient.appendChild(startStop);
        gradient.appendChild(endStop);

        // Append the gradient to the SVG container
        svgContainer.appendChild(gradient);
        
        // Apply bronzer to the areas (forehead, cheeks, jawline)
        properties.bronzerAreas.forEach(area => {
            const bronzerOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            bronzerOverlay.setAttribute('class', `makeup-overlay ${type}`);

            // Calculate the center of the ellipse
            const cx = area.x + area.width / 2;
            const cy = area.y + area.height / 2;
            
            bronzerOverlay.setAttribute('cx', cx.toString());
            bronzerOverlay.setAttribute('cy', cy.toString());
            bronzerOverlay.setAttribute('rx', (area.width / 2).toString());
            bronzerOverlay.setAttribute('ry', (area.height / 2).toString());
            bronzerOverlay.setAttribute('fill', `url(#${gradId})`); // Apply the gradient here

            // Apply the rotation transform to the ellipse
            bronzerOverlay.setAttribute('transform', `rotate(${area.rotation} ${cx} ${cy})`);
    
            svgContainer.appendChild(bronzerOverlay);
        });
    
        container.appendChild(svgContainer);
        console.log('SVG container with bronzer:', svgContainer.outerHTML);
    
        return svgContainer;
    } else if (type === 'eyebrow' && properties.eyebrows) {
        // Create an SVG container element for eyebrows
        const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgContainer.setAttribute('style', 'position: absolute; overflow: visible; z-index: 2000;');
        svgContainer.setAttribute('width', properties.width);
        svgContainer.setAttribute('height', properties.height);
        svgContainer.setAttribute('viewBox', `0 0 ${properties.width} ${properties.height}`);
      
        properties.eyebrows.forEach(eyebrow => {
            console.log('eyebrow:', eyebrow);
            let eyebrowOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            eyebrowOverlay.setAttribute('class', `makeup-overlay ${type}`);
            eyebrowOverlay.setAttribute('d', eyebrow.pathD); 
            eyebrowOverlay.setAttribute('fill', properties.color);
            eyebrowOverlay.setAttribute('fill-opacity', properties.opacity);
        
            // Append the path to the SVG container
            svgContainer.appendChild(eyebrowOverlay);
        });
      
        // Append the SVG container to the overlay container
        container.appendChild(svgContainer);
        console.log('SVG container with eyebrow overlay:', svgContainer.outerHTML);
        
        return svgContainer;
    } else if (type === 'eyeliner' && properties.eyeliners) {
        // Create an SVG container element for eyeliner
        const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgContainer.setAttribute('style', 'position: absolute; overflow: visible; z-index: 2000;');
        svgContainer.setAttribute('width', properties.width);
        svgContainer.setAttribute('height', properties.height);
        svgContainer.setAttribute('viewBox', `0 0 ${properties.width} ${properties.height}`);
      
        properties.eyeliners.forEach(eyeliner => {
            console.log('eyelinerPath:', eyeliner);
            let eyelinerOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            eyelinerOverlay.setAttribute('class', `makeup-overlay ${type}`);
            eyelinerOverlay.setAttribute('d', eyeliner.pathD); 
            eyelinerOverlay.setAttribute('fill', properties.color);
            eyelinerOverlay.setAttribute('fill-opacity', properties.opacity);
            eyelinerOverlay.setAttribute('stroke', properties.color); // Eyeliner color
            eyelinerOverlay.setAttribute('stroke-width', properties.strokeWidth || '2'); // Eyeliner thickness
            
            // Append the path to the SVG container
            svgContainer.appendChild(eyelinerOverlay);
        });
      
        // Append the SVG container to the overlay container
        container.appendChild(svgContainer);
        console.log('SVG container with eyeliner overlay:', svgContainer.outerHTML);
        
        return svgContainer;
    } else if (type === 'eyeshadow' && properties.eyeshadowArea) {
        overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        overlay.setAttribute('class', `makeup-overlay ${type}`);
        overlay.setAttribute('style', 'position: absolute; overflow: visible; z-index: 2000;');
        overlay.setAttribute('width', properties.width);
        overlay.setAttribute('height', properties.height);
        overlay.setAttribute('viewBox', `0 0 ${properties.width} ${properties.height}`);

        // Define a gradient for the eyeshadow
        const gradId = 'eyeshadow-gradient';
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        gradient.setAttribute('id', gradId);

        // Position the gradient at the center of the eyeshadow area
        gradient.setAttribute('cx', '50%');
        gradient.setAttribute('cy', '50%');
        gradient.setAttribute('r', '50%');
        gradient.setAttribute('fx', '50%');
        gradient.setAttribute('fy', '50%');

        // Create gradient stops, from full opacity in the middle to transparent at the edges
        const startStop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        startStop.setAttribute('offset', '40%'); // Full opacity until 30% of the radius
        startStop.setAttribute('stop-color', properties.color);
        startStop.setAttribute('stop-opacity', properties.opacity);

        const endStop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        endStop.setAttribute('offset', '100%'); // Fully transparent at the edges
        endStop.setAttribute('stop-color', properties.color);
        endStop.setAttribute('stop-opacity', '0');

        // Append the stops to the gradient
        gradient.appendChild(startStop);
        gradient.appendChild(endStop);

        // Append the gradient definition to the SVG
        defs.appendChild(gradient);
        overlay.appendChild(defs);

        ['left', 'right'].forEach(side => {
            const eyeArea = properties.eyeshadowArea[side];
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', eyeArea); 
            path.setAttribute('x', eyeArea.x);
            path.setAttribute('y', eyeArea.y);
            path.setAttribute('width', eyeArea.width);
            path.setAttribute('height', eyeArea.height);
            //path.setAttribute('fill', properties.color); // Set the color for the eyeshadow
            path.setAttribute('fill', `url(#${gradId})`); // Apply the gradient here

            overlay.appendChild(path);
        });
    } else if (type === 'foundation' && properties.foundationArea) {
        overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        overlay.setAttribute('class', `makeup-overlay ${type}`);
        overlay.setAttribute('style', 'position: absolute; overflow: visible; z-index: 10;');
        overlay.setAttribute('width', properties.width);
        overlay.setAttribute('height', properties.height);
        overlay.setAttribute('viewBox', `0 0 ${properties.width} ${properties.height}`);
    
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // Create radial gradient definition
        const gradId = 'foundation-gradient';
        const radialGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        radialGradient.id = gradId;
        radialGradient.setAttribute('cx', '50%');
        radialGradient.setAttribute('cy', '50%');
        radialGradient.setAttribute('r', '50%');
        radialGradient.setAttribute('fx', '50%');
        radialGradient.setAttribute('fy', '50%');

        // Define the gradient from center to edges
        const startStop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        startStop.setAttribute('offset', '70%');
        startStop.setAttribute('stop-color', properties.color);
        startStop.setAttribute('stop-opacity', properties.opacity); // Full opacity at center

        const endStop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        endStop.setAttribute('offset', '100%');
        endStop.setAttribute('stop-color', properties.color);
        endStop.setAttribute('stop-opacity', '0'); // Zero opacity at edges

        // Add stops to the radial gradient
        radialGradient.appendChild(startStop);
        radialGradient.appendChild(endStop);

        // Add gradient to defs
        defs.appendChild(radialGradient);
        overlay.appendChild(defs);

        const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
        mask.id = 'mask-foundation';
    
        // Create a white rectangle that covers the entire SVG area
        const maskRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        maskRect.setAttribute('x', 0);
        maskRect.setAttribute('y', 0);
        maskRect.setAttribute('width', '100%');
        maskRect.setAttribute('height', '100%');
        maskRect.setAttribute('fill', 'white');
        maskRect.setAttribute('fill-opacity', 0.3);
        mask.appendChild(maskRect);
    
        // Function to add exclusion paths to the mask
        const addExclusionToMask = (landmarkFunction, mask) => {
            const points = landmarkFunction.call(properties.landmarks);
            const exclusionPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let d = `M ${points[0]._x},${points[0]._y}`;
            points.forEach((point, index) => {
                if (index > 0){
                    d += ` L ${point._x},${point._y}`;
                }
            });
            d += ' Z'; // Close the path
            exclusionPath.setAttribute('d', d);
            exclusionPath.setAttribute('fill', 'black');
            mask.appendChild(exclusionPath);
        };
    
        // Add exclusion paths for the features (eyes, eyebrows, and mouth) to the mask
        addExclusionToMask(properties.landmarks.getLeftEye, mask);
        addExclusionToMask(properties.landmarks.getRightEye, mask);
        addExclusionToMask(properties.landmarks.getMouth, mask);
        addExclusionToMask(properties.landmarks.getLeftEyeBrow, mask);
        addExclusionToMask(properties.landmarks.getRightEyeBrow, mask);
    
        defs.appendChild(mask);
        overlay.appendChild(defs);
    
        // Create the path for the foundation
        const foundationPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        foundationPath.setAttribute('d', properties.foundationArea);
        foundationPath.setAttribute('fill', `url(#${gradId})`);
        //foundationPath.setAttribute('fill-opactiy', 0.5);
        foundationPath.setAttribute('mask', `url(#${mask.id})`); // Apply the mask here
        overlay.appendChild(foundationPath);
    }
    if (overlay) {
        container.appendChild(overlay);
        console.log(`Appended overlay:`, overlay.outerHTML);
        return overlay;
    }
};

export const updateMakeupOverlays = (detections, tryOnProduct, container, videoElement, opacity) => {
    container.innerHTML = ''; // Clears any existing overlays
    console.log(`[updateMakeupOverlays] Function called with product: `, tryOnProduct);

    // Exit if no product is selected
    if (!tryOnProduct || !detections || !videoElement) return;

    // Handle lipstick
    if (tryOnProduct.type === 'lipstick' && detections.landmarks) {
        const lips = detections.landmarks.getMouth();

        // Make sure there are detected lip points before proceeding
        if (lips.length) {
            // Create the SVG path string
            const pathD = drawLipOutline(lips); 

            createMakeupOverlay(container, tryOnProduct.type, {
                color: tryOnProduct.closest_shade_hex,
                pathD: pathD,
                width: videoElement.offsetWidth,
                height: videoElement.offsetHeight,
                opacity: opacity 
            });
        }
    }
    // Handle lip liner
    if (tryOnProduct.type === 'lip_liner' && detections.landmarks) {
        const lips = detections.landmarks.getMouth();

        if (lips.length) {
            const pathD = drawLipLinerOutline(lips);

            createMakeupOverlay(container, tryOnProduct.type, {
                color: tryOnProduct.closest_shade_hex,
                pathD: pathD,
                width: videoElement.offsetWidth,
                height: videoElement.offsetHeight,
                opacity: opacity 
            });
        }
    }
    // Handle blush
    if (tryOnProduct.type === 'blush' && detections.landmarks) {
        console.log('Attempting to update blush overlays.');
        const cheeks = getCheeks(detections.landmarks);
        console.log('cheeks:', cheeks);

        createMakeupOverlay(container, tryOnProduct.type, {
            color: tryOnProduct.closest_shade_hex,
            cheeks: cheeks,
            opacity: 0.5, 
            width: videoElement.offsetWidth,
            height: videoElement.offsetHeight,
            opacity: opacity 
        });
        console.log('Finished attempting to update blush overlays.');
    }
    // Handle bronzer
    if (tryOnProduct.type === 'bronzer' && detections.landmarks) {
        console.log('Attempting to update bronzer overlays.');
        const bronzerAreas = getBronzerAreas(detections.landmarks);
        console.log('bronzerAreas:', bronzerAreas);

        createMakeupOverlay(container, tryOnProduct.type, {
            color: tryOnProduct.closest_shade_hex,
            bronzerAreas: bronzerAreas,
            opacity: 0.5, 
            width: videoElement.offsetWidth,
            height: videoElement.offsetHeight,
            opacity: opacity 
        });
        console.log('Finished attempting to update blush overlays.');
    }
    // Handle eyebrow
    if (tryOnProduct.type === 'eyebrow' && detections.landmarks) {
        console.log('Attempting to update eyebrow overlays.');
        const eyebrows = getEyebrows(detections.landmarks); 
        console.log('eyebrows:', eyebrows);
      
        createMakeupOverlay(container, tryOnProduct.type, {
            color: tryOnProduct.closest_shade_hex,
            eyebrows: eyebrows,
            width: videoElement.offsetWidth,
            height: videoElement.offsetHeight,
            opacity: opacity 
        });
        console.log('Finished attempting to update eyebrow overlays.');
      }
    //Handle eyeliner
    if (tryOnProduct.type === 'eyeliner' && detections.landmarks) {
        console.log('Attempting to update eyeliner overlays.');
        const eyeliners = getEyelinerPaths(detections.landmarks); 
        console.log('eyeliner:', eyeliners);
      
        createMakeupOverlay(container, tryOnProduct.type, {
            color: tryOnProduct.closest_shade_hex,
            eyeliners: eyeliners,
            width: videoElement.offsetWidth,
            height: videoElement.offsetHeight,
            opacity: opacity
        });
        console.log('Finished attempting to update eyeliner overlays.');
      }
    // Handle eyeshadow
    if (tryOnProduct.type === 'eyeshadow' && detections.landmarks) {
        console.log('Attempting to update eyeshadow overlays.');
        const eyeshadowArea = getEyeshadowArea(detections.landmarks);
        console.log('eyeshadowArea:', eyeshadowArea);
    
        createMakeupOverlay(container, tryOnProduct.type, {
          color: tryOnProduct.closest_shade_hex,
          eyeshadowArea: eyeshadowArea,
          width: videoElement.offsetWidth,
          height: videoElement.offsetHeight,
          opacity: opacity 
        });
        console.log('Finished attempting to update eyeshadow overlays.');
      }
    // Handle foundation
    if (tryOnProduct.type === 'foundation' && detections.landmarks) {
        console.log('Attempting to update foundation overlays.');
        const foundationArea = getFoundationArea(detections.landmarks);

        createMakeupOverlay(container, tryOnProduct.type, {
            color: tryOnProduct.closest_shade_hex, 
            foundationArea: foundationArea,
            width: videoElement.offsetWidth,
            height: videoElement.offsetHeight,
            landmarks: detections.landmarks,
            opacity: opacity 
        });
        console.log('Finished attempting to update foundation overlays.');
    }
};


const drawLipOutline = (lips) => {
    console.log('lips data', lips)
    if (!lips || lips.length !== 20) return ''; 

    // Split upper and lower lips
    const upperLipOuter = lips.slice(0, 7); 
    const upperLipInner = lips.slice(7, 12).concat(lips[0]);
    const lowerLipOuter = lips.slice(12, 17); 
    const lowerLipInner = lips.slice(17, 20); 

    // Start with the outer part of the upper lip
    let pathD = `M ${upperLipOuter[0].x},${upperLipOuter[0].y}`;
    upperLipOuter.concat(upperLipInner).forEach((point, index) => {
        if (index > 0) {
            pathD += ` L ${point.x},${point.y}`;
        }
    });

    // Then draw the inner part of the lower lip if the mouth is closed
    // To determine if the mouth is open, check the distance between the inner parts
    const OPEN_MOUTH_THRESHOLD = 0.02;
    const isMouthOpen = Math.abs(lowerLipInner[0].y - upperLipInner[upperLipInner.length - 1].y) > OPEN_MOUTH_THRESHOLD;
    if (!isMouthOpen) {
        pathD += ` L ${lowerLipInner[0].x},${lowerLipInner[0].y}`;
        lowerLipInner.reverse().forEach((point, index) => {
            if (index > 0) {
                pathD += ` L ${point.x},${point.y}`;
            }
        });
    }
    //pathD += ` L ${lips[19].x},${lips[19].y}`;

    // // Continue with the outer part of the lower lip
    lowerLipOuter.reverse().forEach((point) => {
        pathD += ` L ${point.x},${point.y}`;
    });
    pathD += ' Z';
    //pathD += ` L ${lips[7].x},${lips[7].y}`;

    if (!isMouthOpen) {
        pathD += ' Z'; // Close the path if the mouth is closed
    }
    console.log('pathD', pathD)
    return pathD;
};

const drawLipLinerOutline = (lips) => {
    if (!lips || lips.length !== 20) {
        console.error('Lip data is incorrect');
        return '';
    }

    const upperLipOuter = lips.slice(0, 7); 
    const upperLipInner = lips.slice(7, 12);

    let pathD = `M ${upperLipOuter[0].x},${upperLipOuter[0].y}`;
    upperLipOuter.slice(1).forEach(point => pathD += ` L ${point.x},${point.y}`);
    pathD += ` L ${upperLipInner[0].x},${upperLipInner[0].y}`;
    upperLipInner.slice(1).forEach(point => pathD += ` L ${point.x},${point.y}`);
    pathD += ` L ${upperLipOuter[0].x},${upperLipOuter[0].y}`; 

    return pathD;
};

const getCheeks = (landmarks) => {
    console.log('Calculating cheeks positions.');
    // Identify the cheek area based on face landmarks
    const jawline = landmarks.getJawOutline();
    const nose = landmarks.getNose();
    console.log('jawline and nose:', jawline, nose);

    // Define the cheeks region
    const cheekWidth = (jawline[14].x - jawline[4].x) / 3;
    const cheekHeight = (jawline[8].y - nose[0].y) / 3;
    const cheekX = jawline[4].x + cheekWidth / 2;
    const cheekY = nose[0].y + cheekHeight / 2 + 10;

    const cheeks = {
        leftCheek: { x: cheekX, y: cheekY, width: cheekWidth, height: cheekHeight },
        rightCheek: { x: jawline[14].x - cheekWidth / 2 , y: cheekY, width: cheekWidth, height: cheekHeight },
    };

    console.log('Calculated cheeks positions:', cheeks);
    return cheeks;
};

const getBronzerAreas = (landmarks) => {
    if (!landmarks) {
        console.error('No landmarks provided to getBronzerAreas function.');
        return null;
    }

    const jawline = landmarks.getJawOutline();
    const nose = landmarks.getNose();
    const leftEyeBrow = landmarks.getLeftEyeBrow();
    const rightEyeBrow = landmarks.getRightEyeBrow();
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    // Validate if got all needed landmark regions
    if (!jawline || !nose || !leftEyeBrow || !rightEyeBrow || !leftEye || !rightEye) {
        console.error('One or more required landmark regions are undefined.');
        return null;
    }

    // Calculate the width and height of the face based on the landmarks
    const faceWidth = Math.abs(jawline[0].x - jawline[16].x);
    const faceHeight = Math.abs(nose[0].y - jawline[8].y);

    // Calculate the bronzer areas based on facial landmarks
    const temples = [
        { // Left temple
            x: leftEyeBrow[0].x - (faceWidth * 0.1) + 10,
            y: leftEyeBrow[0].y + 20,
            width: faceWidth * 0.2 - 10,
            height: faceHeight * 0.1,
            rotation: 20 // slant to the left for left temple
        },
        { // Right temple
            x: rightEyeBrow[4].x - (faceWidth * 0.1) + 10,
            y: rightEyeBrow[4].y + 20,
            width: faceWidth * 0.2 -10,
            height: faceHeight * 0.1,
            rotation: -20
        }
    ];

    const cheekbones = [
        { // Left cheekbone
            x: leftEye[0].x - 40,
            y: jawline[2].y - (faceHeight * 0.15),
            width: faceWidth * 0.3,
            height: faceHeight * 0.2,
            rotation: 20
        },
        { // Right cheekbone
            x: rightEye[3].x - (faceWidth * 0.25) + 40,
            y: jawline[14].y - (faceHeight * 0.15),
            width: faceWidth * 0.3,
            height: faceHeight * 0.2,
            rotation: -20
        }
    ];

    const jawArea = [
        { // Left jaw
            x: jawline[5].x - 30,
            y: jawline[5].y,
            width: faceWidth * 0.4,
            height: faceHeight * 0.1,
            rotation: 40
        },
        { // Right jaw
            x: jawline[11].x - (faceWidth * 0.25),
            y: jawline[11].y,
            width: faceWidth * 0.4,
            height: faceHeight * 0.1,
            rotation: -40
        }
    ];

    const hairline = [
        { // Left hairline
            x: leftEyeBrow[0].x + (faceWidth * 0.1), 
            y: leftEyeBrow[0].y - (faceHeight * 0.2) - 40, 
            width: faceWidth * 0.2,
            height: faceHeight * 0.1,
            rotation: -20 // Slant to the left
        },
        { // Right hairline
            x: rightEyeBrow[4].x - (faceWidth * 0.3), 
            y: rightEyeBrow[4].y - (faceHeight * 0.2) - 40, 
            width: faceWidth * 0.2,
            height: faceHeight * 0.1,
            rotation: 20 // Slant to the right
        }
    ];

    return [...temples, ...cheekbones, ...jawArea, ...hairline];
};

const getEyebrows = (landmarks) => {
    if (!landmarks) {
      console.error('No landmarks provided to getEyebrows function.');
      return null;
    }
  
    const leftEyebrowPoints = landmarks.getLeftEyeBrow(); 
    const rightEyebrowPoints = landmarks.getRightEyeBrow(); 

    const leftEyebrowPathD = createEyebrowPath(leftEyebrowPoints);
    const rightEyebrowPathD = createEyebrowPath(rightEyebrowPoints);

    // Return an array of eyebrow data
    return [
        { pathD: leftEyebrowPathD },
        { pathD: rightEyebrowPathD }
    ];
  
    // Function to create the SVG path string for an eyebrow
    function createEyebrowPath(eyebrowPoints) {
      let pathD = `M ${eyebrowPoints[0].x} ${eyebrowPoints[0].y}`;
      for (let i = 1; i < eyebrowPoints.length; i++) {
        pathD += ` L ${eyebrowPoints[i].x} ${eyebrowPoints[i].y}`;
      }
      pathD += ' Z';
      return pathD;
    }
  };

const getEyelinerPaths = (landmarks) => {
    if (!landmarks) {
      console.error('No landmarks provided to getEyelinerPaths function.');
      return null;
    }

    const leftEye = landmarks.getLeftEye(); 
    const rightEye = landmarks.getRightEye();
    console.log('left eye:', leftEye);
    console.log('right eye:', rightEye);

    const outerCornerLeft = {
        _x: leftEye[0]._x + 5, // Subtracted wingHeight to move base point to the left
        _y: leftEye[0]._y,
      };
      //leftEye[0]; // Example coordinates for the outer corner of the eye
    //const outerCornerRight = rightEye[3]; // Example coordinates for the outer corner of the eye
    const outerCornerRight = {
        _x: rightEye[3]._x, // Subtracted wingHeight to move base point to the left
        _y: rightEye[3]._y,
      };

    let rightEyelinerPathD = createEyelinerPathRight(outerCornerRight);
    console.log('rightteyelinerpath', rightEyelinerPathD)

    // To create the left eye path,  mirror the right eye path
    //let leftEyelinerPathD = ' d="rightEyelinerPathD" ' + ` transform="scale(-1, 1) translate(-30, 0)"`;
    let leftEyelinerPathD = createEyelinerPathLeft(outerCornerLeft, outerCornerRight);
    console.log('lefteyelinerpath', leftEyelinerPathD)

  
    //return [leftEyelinerPathD, rightEyelinerPathD];
    // Return an array of eyebrow data
    return [
        { pathD: leftEyelinerPathD },
        { pathD: rightEyelinerPathD }
    ];

    function createEyelinerPathRight(outerCorner) {
        // Define the wing's dimensions
        const wingWidth = 10; // The base width of the triangle wing
        const wingHeight = 10; // The height of the triangle wing
    
        // Wing angle in degrees
        const angleDegrees = 30; 
        // Convert the angle to radians
        const angleRadians = (Math.PI / 180) * angleDegrees;
    
        // Calculate the wingTip coordinates
        const wingTip = {
          _x: outerCorner._x + 10 + wingWidth * Math.cos(angleRadians),
          _y: outerCorner._y - wingWidth * Math.sin(angleRadians),
        };
    
        // Calculate the base coordinates
        const baseLeft = {
          _x: outerCorner._x + 10 - wingHeight, // Subtracted wingHeight to move base point to the left
          _y: outerCorner._y,
        };
        const baseRight = {
          _x: outerCorner._x + 10,
          _y: outerCorner._y,
        };
    
        // Create the SVG path
        let pathD = `M ${baseLeft._x},${baseLeft._y} `; // Move to base left
        pathD += `L ${wingTip._x},${wingTip._y} `; // Line to wing tip
        pathD += `L ${baseRight._x},${baseRight._y} `; // Line to base right
        pathD += 'Z'; // Close the path
    
        return pathD;
    }

    function createEyelinerPathLeft(outerCornerLeft, outerCornerRight) {
        // Define the wing's dimensions
        const wingWidth = 10; // The base width of the triangle wing
        const wingHeight = 10; // The height of the triangle wing
    
        // The furthest x-coordinate point for the right eye's wing tip
        const rightEyeWingTipX = outerCornerRight._x + 10 + wingWidth * Math.cos((Math.PI / 180) * 30);
    
        // The distance from the right eye's outer corner to the wing tip
        const distanceToWingTip = rightEyeWingTipX - outerCornerRight._x;
    
        // The left eye's wing tip should be the same distance from the outer corner, but mirrored
        const leftEyeWingTipX = outerCornerLeft._x - distanceToWingTip;
    
        const wingTip = {
            _x: leftEyeWingTipX,
            _y: outerCornerLeft._y - wingWidth * Math.sin((Math.PI / 180) * 30),
        };
    
        const baseLeft = {
            _x: outerCornerLeft._x,
            _y: outerCornerLeft._y,
        };
        const baseRight = {
            _x: outerCornerLeft._x - wingHeight, // Move base point to the right for the left eye
            _y: outerCornerLeft._y,
        };
    
        // Create the SVG path using the mirrored coordinates
        let pathD = `M ${baseRight._x},${baseRight._y} `; // Move to base right (mirrored)
        pathD += `L ${wingTip._x},${wingTip._y} `; // Line to wing tip (mirrored)
        pathD += `L ${baseLeft._x},${baseLeft._y} `; // Line to base left (mirrored)
        pathD += 'Z'; // Close the path
    
        return pathD;
    }
};

const getEyeshadowArea = (landmarks) => {
    const createCurvedEyeshadowPath = (eyePoints, height) => {
        
        const start = {
            _x: eyePoints[0]._x - 5,
            _y: eyePoints[0]._y + 10,
        };
        const end = {
            _x: eyePoints[3]._x + 5,
            _y: eyePoints[3]._y + 10,
        };
        const topCurveStart = { _x: start._x, _y: start._y - height };
        const topCurveEnd = { _x: end._x, _y: end._y - height };

        // Curve control points
        const control1 = { _x: eyePoints[0]._x, _y: eyePoints[0]._y - height / 2 };
        const control2 = { _x: eyePoints[3]._x, _y: eyePoints[3]._y - height / 2 };
        const topControl1 = { _x: control1._x, _y: control1._y - height / 2 };
        const topControl2 = { _x: control2._x, _y: control2._y - height / 2 };

        let path = `M ${start._x},${start._y}`;
        path += ` C ${control1._x},${control1._y} ${control2._x},${control2._y} ${end._x},${end._y}`;
        path += ` L ${topCurveEnd._x},${topCurveEnd._y}`;
        path += ` C ${topControl2._x},${topControl2._y} ${topControl1._x},${topControl1._y} ${topCurveStart._x},${topCurveStart._y}`;
        path += ' Z';

        return path;
    };

    // The height of the eyeshadow above the eye
    const eyeshadowHeight = 20;

    // Extract eye points
    const leftEyePoints = landmarks.getLeftEye();
    const rightEyePoints = landmarks.getRightEye(); 

    // Create the eyeshadow paths for both eyes
    const leftEyeshadowPath = createCurvedEyeshadowPath(leftEyePoints, eyeshadowHeight);
    const rightEyeshadowPath = createCurvedEyeshadowPath(rightEyePoints, eyeshadowHeight);

    return {
        left: leftEyeshadowPath,
        right: rightEyeshadowPath
    };
};

const getFoundationArea = (landmarks) => {
    const jawOutline = landmarks.getJawOutline();
    const nose = landmarks.getNose();

    // Calculate the width and height of the face 
    const faceWidth = Math.abs(jawOutline[0].x - jawOutline[16].x);
    const faceHeight = Math.abs(nose[0].y - jawOutline[8].y);

    const hairline = [
        {
            x: landmarks.getLeftEyeBrow()[0].x + (faceWidth * 0.1) + 10,
            y: landmarks.getLeftEyeBrow()[0].y - (faceHeight * 0.2) - 40,
        },
        {
            x: landmarks.getRightEyeBrow()[4].x - (faceWidth * 0.3) + 40,
            y: landmarks.getRightEyeBrow()[4].y - (faceHeight * 0.2) - 40,
        },
        {
            x: landmarks.getLeftEyeBrow()[4].x - (faceWidth * 0.1) + 40 + 20 ,
            y: landmarks.getLeftEyeBrow()[4].y - (faceHeight * 0.2) - 40 -10,
        }
    ];

    // Starting from the left side of the jaw, go up to the left hairline
    let pathD = `M ${jawOutline[0].x},${jawOutline[0].y} L ${hairline[0].x},${hairline[0].y}`;

    // Draw a line across the forehead to the right hairline
    pathD += ` L ${hairline[2].x},${hairline[2].y}`;

    // Draw a line across the forehead to the right hairline
    pathD += ` L ${hairline[1].x},${hairline[1].y}`;

    // Go down to the right side of the jaw
    pathD += ` L ${jawOutline[jawOutline.length - 1].x},${jawOutline[jawOutline.length - 1].y}`;

    // Draw the jawline to complete the foundation area
    for (let i = jawOutline.length - 1; i >= 0; i--) {
        pathD += ` L ${jawOutline[i].x},${jawOutline[i].y}`;
    }

    // Close the path at the starting point
    pathD += ' Z';

    return pathD;
};