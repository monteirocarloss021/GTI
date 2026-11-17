"""Run with Python + Playwright and Chromium. Serves the exact HTML from memory."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright

HTML = (Path(__file__).resolve().parents[1] / "index.html").read_text()
ORIGIN = "http://infra.test/"
with sync_playwright() as driver:
    browser = driver.chromium.launch(
        executable_path=shutil.which("chromium"),
        args=["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    )
    page = browser.new_page(viewport={"width": 720, "height": 540})
    errors, external = [], []
    page.on("pageerror", lambda e: errors.append(str(e)))

    def serve(route):
        if route.request.url == ORIGIN:
            route.fulfill(content_type="text/html; charset=utf-8", body=HTML)
        else:
            external.append(route.request.url)
            route.abort()

    page.route("http**/*", serve)
    page.goto(ORIGIN)
    page.locator("#start").click()

    def choose(index=0):
        page.locator("#choices button").nth(index).click(timeout=12000)

    def walk():
        page.wait_for_function("()=>!!goal&&!beacon.hidden")
        page.locator("#beacon").dispatch_event("click")
        page.wait_for_function("()=>!go", timeout=35000)

    def completed(index):
        assert page.evaluate("i=>mission===i&&ending&&unlocked>=i+1", index)
        print(f"Capítulo {index+1} concluído.", flush=True)

    # Toka: gather party, order, carry drinks, hear encouragement and have the conversation.
    choose()
    walk()
    walk()
    choose()
    walk()
    choose()
    walk()
    page.keyboard.press("g")
    while page.evaluate("drinker>=0"):
        choose()
    choose()
    choose()
    walk()
    for _ in range(4):
        choose()
    completed(0)
    assert page.evaluate("albumToka.startsWith('data:image/jpeg')")

    # Both rounds use screen coordinates and the same 3D hit test as touch input.
    choose()
    choose()
    walk()
    choose()
    for count in (4, 6):
        page.wait_for_timeout(450)
        for _ in range(count):
            point = page.evaluate("""()=>{
              const pts=[],r=display3D.getBoundingClientRect();
              for(let y=r.top+25;y<r.bottom;y+=7)for(let x=r.left+7;x<r.right;x+=7){
                if(world3d.click({clientX:x,clientY:y},mini)?.disc===mini.targets[0])pts.push([x,y])
              }
              return pts.length?[0,1].map(k=>pts.reduce((sum,p)=>sum+p[k],0)/pts.length):null
            }""")
            assert point, "Alvo do duelo fora da tela"
            page.mouse.click(*point)
            page.wait_for_timeout(110)
        choose()
    walk()
    completed(1)

    # Mango: six voices, two rescues and the return to the H8.
    choose()
    choose()
    walk()
    choose()
    choose()
    for _ in range(6):
        walk()
    choose()
    for _ in range(2):
        walk()
        page.keyboard.press("x")
    walk()
    completed(2)

    # Fire: testimony and the correct box. Both photos must be available.
    choose()
    choose()
    for _ in range(3):
        walk()
        choose()
    walk()
    page.get_by_text("Azul · fita amarela · adesivo torto", exact=True).click()
    completed(3)
    page.locator("#album").wait_for(state="visible")
    assert page.evaluate("()=>[$('oldPhoto'),$('newPhoto')].every(i=>i.src.startsWith('data:image/jpeg'))")

    choose()
    choose()
    walk()
    walk()
    choose()
    page.keyboard.press("m")
    walk()
    choose(1)
    completed(4)

    choose()
    choose()
    walk()
    # The first incorrect response opens a rebuttal and permits a correction.
    choose(0)
    choose()
    for i, correct in enumerate((2, 1, 3, 0, 2)):
        choose(correct)
        if i < 4:
            choose()
    completed(5)
    choose()
    choose()
    page.reload()
    page.locator("#chap").click()
    assert page.locator("#choices button").count() == 7
    assert not errors, errors
    assert not external, external
    print("Seis missões, fotos, créditos e retomada validados sem recursos externos.")
    browser.close()
