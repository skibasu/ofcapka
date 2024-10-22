import React, { useRef, useEffect, useState } from "react"

const CanvasWithArrow: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [angle, setAngle] = useState(0) // Kąt w stopniach, początkowo 0 (godzina 12)
    const [startAngle, setStartAngle] = useState(0) // Kąt początkowy przy rozpoczęciu przeciągania
    const [hoveredHour, setHoveredHour] = useState<number | null>(null) // Trzyma aktualnie najechaną godzinę
    const [highlightedHour, setHighlightedHour] = useState<number | null>(12) // Trzyma godzinę, która jest podświetlana przez wskazówkę
    const hourPositions = useRef<{ hour: number; x: number; y: number }[]>([]) // Referencja na pozycje godzin

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext("2d")
        if (!context) return

        // Ustawienie rozmiaru canvasu
        canvas.width = 220
        canvas.height = 220

        const centerX = 110 // środek okręgu
        const centerY = 110
        const radius = 100 // promień okręgu
        const smallCircleRadius = 5 // promień małego kółka w środku
        const arrowLength = 12 // Powiększona długość strzałki (czubka)

        // Czyszczenie canvasu przed każdym rysowaniem
        context.clearRect(0, 0, canvas.width, canvas.height)

        // Rysowanie dużego szarego okręgu
        context.beginPath()
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        context.fillStyle = "gray"
        context.fill()
        context.stroke()

        // Rysowanie małego białego kółka w środku
        context.beginPath()
        context.arc(centerX, centerY, smallCircleRadius, 0, 2 * Math.PI)
        context.fillStyle = "white"
        context.fill()

        // Rysowanie cyfr zegara od 12 do 12
        const hourRadius = radius - 25 // Odległość cyfr od środka
        const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

        // Zerowanie pozycji godzin przed nowym rysowaniem
        hourPositions.current = []

        hours.forEach((hour, index) => {
            context.globalAlpha = 1
            const angleForHour = (index * 30 - 90) * (Math.PI / 180) // Kąt w radianach dla godziny, z przesunięciem o -90 stopni
            const hourX = centerX + hourRadius * Math.cos(angleForHour)
            const hourY = centerY + hourRadius * Math.sin(angleForHour)

            // Zapisanie pozycji każdej godziny do referencji
            hourPositions.current.push({ hour, x: hourX, y: hourY })

            // Podświetlenie godziny, na którą najechano myszką
            if (hoveredHour === hour) {
                context.globalAlpha = 0.3 // Ustawienie półprzezroczystego tła
                context.beginPath()
                context.arc(hourX, hourY, 16, 0, 2 * Math.PI) // Tworzenie tła za cyfrą
                context.fillStyle = "white"
                context.fill()
            }

            // Podświetlenie godziny, na którą wskazuje strzałka
            if (highlightedHour === hour) {
                context.globalAlpha = 0.5 // Ustawienie półprzezroczystego tła dla godziny wskazywanej przez strzałkę
                context.beginPath()
                context.arc(hourX, hourY, 16, 0, 2 * Math.PI)
                context.fillStyle = "blue"
                context.fill()
            }

            context.globalAlpha = 1 // Pełna przezroczystość dla cyfr
            context.font = "16px Arial"
            context.fillStyle = "white"
            context.textAlign = "center"
            context.textBaseline = "middle"
            context.fillText(hour.toString(), hourX, hourY)
        })

        // Obliczanie końca linii na obwodzie okręgu
        const adjustedRadius = radius - arrowLength - 40 // Skracamy linię, aby była przed cyframi
        const angleInRadians = (angle - 90) * (Math.PI / 180) // Zamiana kąta na radiany z przesunięciem o -90 stopni

        const lineEndX = centerX + adjustedRadius * Math.cos(angleInRadians)
        const lineEndY = centerY + adjustedRadius * Math.sin(angleInRadians)

        // Rysowanie linii
        context.beginPath()
        context.moveTo(centerX, centerY) // Początek linii w środku okręgu
        context.lineTo(lineEndX, lineEndY) // Koniec linii, skrócony o połowę długości strzałki
        context.strokeStyle = "white" // Ustawienie koloru linii
        context.lineWidth = 2 // Grubość linii
        context.stroke()

        // Rysowanie białej strzałki skierowanej grotem w stronę cyfr
        drawArrow(context, lineEndX, lineEndY, angleInRadians, arrowLength)

        // Funkcja do rysowania strzałki
        function drawArrow(
            ctx: CanvasRenderingContext2D,
            x: number,
            y: number,
            angle: number,
            length: number
        ) {
            const arrowWidth = 12 // Powiększona szerokość strzałki
            ctx.beginPath()
            // Grot skierowany w stronę cyfr, dlatego dodajemy kąt strzałki
            ctx.moveTo(
                x + length * Math.cos(angle),
                y + length * Math.sin(angle)
            ) // Czubek strzałki
            ctx.lineTo(
                x - arrowWidth * Math.cos(angle - Math.PI / 6),
                y - arrowWidth * Math.sin(angle - Math.PI / 6)
            ) // Lewe skrzydło
            ctx.lineTo(
                x - arrowWidth * Math.cos(angle + Math.PI / 6),
                y - arrowWidth * Math.sin(angle + Math.PI / 6)
            ) // Prawe skrzydło
            ctx.closePath()
            ctx.fillStyle = "white"
            ctx.fill()
        }

        // Sprawdzenie, na której godzinie powinna być strzałka
        const roundedHour = Math.floor(angle / 30) % 12 || 12
        setHighlightedHour(roundedHour) // Zaktualizuj podświetlaną godzinę

        // Przywrócenie pełnej nieprzezroczystości (opacity) dla kolejnych elementów, jeśli będą rysowane
        context.globalAlpha = 1
    }, [angle, hoveredHour, highlightedHour]) // Dodajemy zależność od highlightedHour

    // Funkcja obliczająca kąt w stopniach na podstawie pozycji myszy
    const calculateAngle = (mouseX: number, mouseY: number) => {
        const canvas = canvasRef.current
        if (!canvas) return angle

        const rect = canvas.getBoundingClientRect()
        const centerX = rect.left + 110 // Środek okręgu w osi X
        const centerY = rect.top + 110 // Środek okręgu w osi Y

        // Obliczanie kąta na podstawie pozycji myszy względem środka okręgu
        const deltaX = mouseX - centerX
        const deltaY = mouseY - centerY
        const radians = Math.atan2(deltaY, deltaX) // Kąt w radianach

        let degrees = radians * (180 / Math.PI) // Zamiana na stopnie
        degrees -= 90 // Korekta o -90 stopni, aby godzina 12 była na górze
        if (degrees < 0) degrees += 360 // Kąt musi być w zakresie [0, 360]
        return degrees
    }

    // Funkcja sprawdzająca, czy kliknięto w godzinę
    const handleClickOnHour = (mouseX: number, mouseY: number) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const canvasX = mouseX - rect.left
        const canvasY = mouseY - rect.top

        hourPositions.current.forEach(({ hour, x, y }) => {
            const distance = Math.sqrt((canvasX - x) ** 2 + (canvasY - y) ** 2)
            if (distance < 15) {
                // Znaleziono klikniętą godzinę, ustawienie kąta z korektą
                const newAngle = hour === 12 ? 0 : hour * 30 // Każda godzina = 30 stopni
                setAngle(newAngle)
            }
        })
    }

    // Rozpoczęcie przeciągania
    const handleMouseDown = (e: React.MouseEvent) => {
        const newAngle = calculateAngle(e.clientX, e.clientY)
        setStartAngle(newAngle) // Zapisz początkowy kąt podczas rozpoczęcia przeciągania
        setIsDragging(true)
    }

    // Aktualizacja kąta podczas przeciągania
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const newAngle = calculateAngle(e.clientX, e.clientY)

            // Oblicz różnicę kąta między początkowym a bieżącym kątem przeciągania
            let deltaAngle = newAngle - startAngle
            if (deltaAngle < 0) deltaAngle += 360 // Zapewnij, że delta jest zawsze dodatnia

            setAngle((prevAngle) => (prevAngle + deltaAngle) % 360) // Ustaw nowy kąt
            setStartAngle(newAngle) // Zaktualizuj początkowy kąt
        }

        // Sprawdzanie, czy kursor jest w pobliżu godziny
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const canvasX = e.clientX - rect.left
        const canvasY = e.clientY - rect.top

        let isHovering = false
        hourPositions.current.forEach(({ hour, x, y }) => {
            const distance = Math.sqrt((canvasX - x) ** 2 + (canvasY - y) ** 2)
            if (distance < 15) {
                setHoveredHour(hour) // Ustawiamy najechaną godzinę
                canvas.style.cursor = "pointer" // Zmiana kursora na pointer
                isHovering = true
            }
        })

        if (!isHovering) {
            setHoveredHour(null)
            canvas.style.cursor = "default" // Przywrócenie domyślnego kursora
        }
    }

    // Zakończenie przeciągania
    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Kliknięcie w canvas, aby ustawić wskazówkę na godzinę
    const handleClick = (e: React.MouseEvent) => {
        handleClickOnHour(e.clientX, e.clientY)
    }

    return (
        <div>
            <canvas
                ref={canvasRef}
                style={{ border: "1px solid black" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handleClick} // Obsługa kliknięć w godziny
            />
        </div>
    )
}

export default CanvasWithArrow