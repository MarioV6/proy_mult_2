import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// Componente para cargar el modelo de forma segura
function Model({ path, color, contrast, onError }: { path: string; color: string; contrast: number; onError: (err: any) => void }) {
  try {
    const { scene } = useGLTF(path);
    
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useEffect(() => {
      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach(m => {
              if ('color' in m) {
                (m as any).color.set(color);
                if ('emissive' in m) {
                  (m as any).emissive.set(color);
                  (m as any).emissiveIntensity = contrast * 0.2;
                }
                if ('roughness' in m) (m as any).roughness = 1 - (contrast * 0.5);
              }
            });
          }
        }
      });
    }, [clonedScene, color, contrast]);

    return <primitive object={clonedScene} />;
  } catch (error) {
    if (onError) onError(error);
    return null;
  }
}

interface Vista3DProps {
  modelPath: string;
  onClose: () => void;
  title: string;
}

const Vista3D = ({ modelPath, onClose, title }: Vista3DProps) => {
  const [hasError, setHasError] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [brightness, setBrightness] = useState(1.2);
  const [contrast, setContrast] = useState(0.5);
  const [autoRotate, setAutoRotate] = useState(false);
  const controlsRef = useRef<any>(null);

  // Posición inicial de la cámara para Zoom x3 (Z menor = más cerca)
  const initialCameraPos: [number, number, number] = [0, 0, 1.8]; 

  useEffect(() => {
    setHasError(false);
  }, [modelPath]);

  const handleReset = () => {
    if (controlsRef.current) {
      // Regresamos a la posición de zoom x3
      controlsRef.current.object.position.set(...initialCameraPos);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="vista-3d-overlay" onClick={onClose}>
      <div className="vista-3d-container" onClick={(e) => e.stopPropagation()}>
        <div className="vista-3d-header">
          <div>
            <h3 style={{ margin: 0, color: 'white' }}>{title}</h3>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#888' }}>
              {hasError ? "⚠️ Archivo no encontrado" : "Vista Interactiva Premium"}
            </p>
          </div>
          <button className="close-3d-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="canvas-container" style={{ display: 'flex', flex: 1 }}>
          <div className="controls-panel premium">
            <div className="control-group">
              <label>Tono de la Tela</label>
              <div className="color-wheel-container">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="modern-color-picker" />
                <span className="color-hex-label">{color.toUpperCase()}</span>
              </div>
            </div>

            <div className="control-group">
              <label>Textura (Brillo)</label>
              <input type="range" min="0" max="1" step="0.01" value={contrast} onChange={(e) => setContrast(parseFloat(e.target.value))} />
            </div>

            <div className="control-group">
              <label>Iluminación</label>
              <input type="range" min="0.1" max="3" step="0.1" value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} />
            </div>

            <div className="divider" />

            <div className="control-group horizontal">
              <label>Auto-Giro</label>
              <div className={`custom-switch ${autoRotate ? 'on' : 'off'}`} onClick={() => setAutoRotate(!autoRotate)}>
                <div className="switch-handle" />
              </div>
            </div>

            <button className="premium-action-btn" onClick={handleReset}>
              Restablecer Zoom x3
            </button>
          </div>

          <div className="main-3d-view">
            {!hasError ? (
              <Suspense fallback={<div className="loading-3d">Iniciando motor 3D...</div>}>
                <Canvas shadows camera={{ position: initialCameraPos, fov: 40 }}>
                  <color attach="background" args={["#0a0a14"]} />
                  <ambientLight intensity={brightness * 0.4} />
                  <pointLight position={[10, 10, 10]} intensity={brightness} />
                  <Environment preset="city" />

                  <Center top>
                    <Model 
                      path={modelPath} 
                      color={color} 
                      contrast={contrast} 
                      onError={() => setHasError(true)} 
                    />
                  </Center>

                  <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} />
                  
                  <OrbitControls 
                    ref={controlsRef} 
                    makeDefault 
                    autoRotate={autoRotate} 
                    autoRotateSpeed={2}
                    minDistance={0.5}
                    maxDistance={8}
                  />
                </Canvas>
              </Suspense>
            ) : (
              <div className="error-overlay">
                <p>El modelo 3D no está disponible todavía.</p>
                <p style={{fontSize: '0.8rem', fontWeight: 'normal'}}>Ruta buscada: public{modelPath}</p>
              </div>
            )}
          </div>
        </div>

        <div className="vista-3d-footer">
          <span>Usa el scroll para zoom • Arrastra para girar</span>
        </div>
      </div>
    </div>
  );
};

export default Vista3D;
