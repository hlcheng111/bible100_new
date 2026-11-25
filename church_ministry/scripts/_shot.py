import sys, base64, json
sys.path.insert(0,"church_ministry/scripts")
import cm_zone_flows as F
# usage: _shot.py out_prefix url[::jsfile-or-expr] ...
args=sys.argv[1:]
r=F.Run(9301)
try:
    for i,a in enumerate(args):
        name,_,rest=a.partition("=")
        url,_,expr=rest.partition("::")
        r.nav(url,2.2)
        if expr:
            print(name, "eval:", r.js(expr))
            r.wait(0.8)
        d=r.c.send("Page.captureScreenshot",{"format":"jpeg","quality":55},timeout=15)
        open(f"church_ministry/audit/stage4/{name}.jpg","wb").write(base64.b64decode(d["data"]))
        errs=r.js("JSON.stringify(window.__errs||[])")
        print(name,"errors:",r.errors[-3:])
finally:
    r.close()
