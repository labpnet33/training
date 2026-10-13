var e={id:`snapshot`,h:{en:`Taking a snapshot: saving network state to a JSON file`,hi:`Snapshot lena: network state ko JSON file mein save karna`},body:{en:`
<p>Before you change anything, you want a photograph of the network. A <b>snapshot</b> is that photograph, saved in a file. Later you take a second photograph and compare. This chapter explains how <code>snapshot.py</code> in lab 1 builds the photograph, one idea at a time.</p>

<h3>Analogy: before-and-after photos of a flat</h3>
<p>When you rent a flat you photograph every wall on day one. When you leave, the same photos prove what was already damaged. A snapshot protects you the same way: if something is broken after your change, the pre snapshot shows whether it was already broken before.</p>

<h3>What to put in a snapshot</h3>
<p>Choose facts that matter and that change when something breaks. Too little and you miss problems; too much and the diff becomes noise (counters and timers change every second, so never save them). The lab snapshot keeps three things:</p>
<ul>
<li><b>OSPF neighbours</b> as a dictionary of router-id to state.</li>
<li><b>Routes</b> as a sorted list of prefixes.</li>
<li><b>BGP state</b> of the session to the ISP (R1 only).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="snapshot.py flow">
<rect x="15" y="60" width="130" height="60" rx="10" fill="#bae6fd"/><text x="80" y="88" text-anchor="middle" class="svg-ink" font-size="14">For each router</text><text x="80" y="106" text-anchor="middle" class="svg-muted" font-size="12">R1, R2, R3</text>
<rect x="195" y="60" width="140" height="60" rx="10" fill="#fde68a"/><text x="265" y="88" text-anchor="middle" class="svg-ink" font-size="14">show() x 2-3</text><text x="265" y="106" text-anchor="middle" class="svg-muted" font-size="12">ospf, routes, bgp</text>
<rect x="385" y="60" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="440" y="88" text-anchor="middle" class="svg-ink" font-size="14">snap dict</text><text x="440" y="106" text-anchor="middle" class="svg-muted" font-size="12">in memory</text>
<rect x="540" y="60" width="90" height="60" rx="10" fill="#bbf7d0"/><text x="585" y="88" text-anchor="middle" class="svg-ink" font-size="14">pre.json</text><text x="585" y="106" text-anchor="middle" class="svg-muted" font-size="12">on disk</text>
<line x1="145" y1="90" x2="195" y2="90" stroke="#64748b" stroke-width="2"/><line x1="335" y1="90" x2="385" y2="90" stroke="#64748b" stroke-width="2"/><line x1="495" y1="90" x2="540" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">json.dump writes the dictionary to a file</text>
</svg><p class="cap">Collect, store in a dictionary, write to JSON.</p></div>

<h3>Walking through snapshot.py</h3>
<pre class="code"><span class="c"># Reference code: the core of snapshot.py (helper show() is from chapter 3)</span>
import sys
import json

name = sys.argv[1]      <span class="c"># the word typed after the file name: "pre" or "post"</span>
snap = {}               <span class="c"># an empty dictionary, one entry per router</span>

for router, ip in ROUTERS.items():
    nbrs = {}
    for intf in show(ip, "show ip ospf neighbor")["interfaces"].values():
        for rid, n in intf["neighbors"].items():
            nbrs[rid] = n["state"]
    routes = sorted(show(ip, "show ip route")["routes"].keys())
    snap[router] = {"ospf": nbrs, "routes": routes}
    print(f"{router}: {len(nbrs)} OSPF neighbours, {len(routes)} routes")

peer = show(ROUTERS["R1"], "show ip bgp summary")["neighbors"]["203.0.113.2"]
snap["R1"]["bgp"] = peer["state"]

with open(name + ".json", "w") as f:
    json.dump(snap, f, indent=2)
print("saved", name + ".json")</pre>
<ul>
<li><code>sys.argv[1]</code> is the first word you type after the script name, so one script serves both "pre" and "post".</li>
<li>The <code>for</code> loop repeats its indented block once per router. <code>.items()</code> gives the name and the address together.</li>
<li>The inner loops walk the OSPF dictionary: every interface, then every neighbour on it.</li>
<li><code>sorted(...keys())</code> takes the prefixes and puts them in order so two snapshots can be compared fairly.</li>
<li><code>with open(..., "w") as f</code> opens a file for writing and closes it safely afterwards. <code>json.dump</code> writes the dictionary as text; <code>indent=2</code> makes it readable.</li>
</ul>

<h3>What running it looks like</h3>
<p>This is the real output from the lab network before any change:</p>
<pre class="out">AUTO&gt; python3 snapshot.py pre
R1: 1 OSPF neighbours, 12 routes
R2: 2 OSPF neighbours, 10 routes
R3: 1 OSPF neighbours, 9 routes
saved pre.json

AUTO&gt; jq '.R2.ospf' pre.json
{
  "1.1.1.1": "FULL/BDR",
  <span class="hl">"3.3.3.3": "FULL/DR"</span>
}</pre>
<p>R2 sits in the middle, so it has two neighbours; R1 and R3 are at the ends and have one each. <code>jq</code> is a small tool that reads a JSON file and prints one part of it.</p>

<div class="eg"><p><b>Worked example.</b> Why sort and why JSON? Suppose R1 lists its routes in a different order today. Without sorting, a naive comparison would say "everything changed". After sorting, equal tables look equal. JSON is plain text, so you can open it in an editor, store it in Git (module auto-git), and attach it to a change ticket as evidence.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Saving values that are always changing, such as uptime, packet counters or timers. Every diff will then show changes and people will learn to ignore the report. Save stable facts only. Another mistake is overwriting pre.json by running <code>snapshot.py pre</code> again after the change; run it once, before.</p></div>
<div class="exam"><p><b>Exam trap.</b> A snapshot is state at one moment, not configuration. A config backup says what the device was told; a state snapshot says what the device is doing. Both are useful; the exam may ask which one proves OSPF actually formed.</p></div>

<div class="scn"><h4>The snapshot that saved the rollback decision</h4><p>An engineer at Deccan Net found BGP down after a change and was about to roll everything back. The pre snapshot showed that BGP had already been Idle before the change started, so the change was innocent and the real fault was a provider issue. The rollback was cancelled and the ticket went to the carrier.</p><p><b>Lesson:</b> the pre snapshot tells you whose fault it is.</p></div>

<div class="iv"><p class="q">"What would you put in a pre-change snapshot, and what would you leave out?"</p><p>Stable, meaningful state: neighbour states, route prefixes, interface status, BGP session state and prefix counts. Leave out volatile data such as counters, timers and uptime that change constantly and would flood the diff. Save it in a structured format like JSON with a timestamp, keep it with the change record.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A snapshot is state saved at one moment; take it before and after a change.</li>
<li>Save stable facts (neighbours, prefixes, session state), never counters or uptime.</li>
<li>sys.argv lets one script write pre.json or post.json.</li>
<li>Sort lists so equal data compares as equal.</li>
<li>JSON files are readable, diffable and fit in Git and tickets.</li>
</ul></div>
`,hi:`
<p>Kuch badalne se pehle aap network ki ek photo chahte ho. <b>Snapshot</b> wahi photo hai, file mein save. Baad mein doosri photo lete ho aur compare karte ho. Yeh chapter samjhata hai ki lab 1 ki <code>snapshot.py</code> yeh photo kaise banati hai, ek-ek idea karke.</p>

<h3>Analogy: flat ki pehle aur baad ki photos</h3>
<p>Flat kiraye par lete ho to pehle din har deewar ki photo kheenchte ho. Chhodte waqt wahi photos prove karti hain ki kya pehle se kharab tha. Snapshot bhi aise hi bachata hai: change ke baad kuch toota ho to pre snapshot batata hai ki woh pehle se toota tha ya nahi.</p>

<h3>Snapshot mein kya rakhein</h3>
<p>Aise facts chuno jo matter karte hain aur kuch toote to badalte hain. Bahut kam rakha to problems miss hongi; bahut zyada rakha to diff shor ban jaata hai (counters aur timers har second badalte hain, unhe kabhi save mat karo). Lab snapshot teen cheezein rakhta hai:</p>
<ul>
<li><b>OSPF neighbours</b> router-id se state ki dictionary ke roop mein.</li>
<li><b>Routes</b> prefixes ki sorted list ke roop mein.</li>
<li>ISP ke session ka <b>BGP state</b> (sirf R1).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="snapshot.py ka flow">
<rect x="15" y="60" width="130" height="60" rx="10" fill="#bae6fd"/><text x="80" y="88" text-anchor="middle" class="svg-ink" font-size="14">Har router ke liye</text><text x="80" y="106" text-anchor="middle" class="svg-muted" font-size="12">R1, R2, R3</text>
<rect x="195" y="60" width="140" height="60" rx="10" fill="#fde68a"/><text x="265" y="88" text-anchor="middle" class="svg-ink" font-size="14">show() x 2-3</text><text x="265" y="106" text-anchor="middle" class="svg-muted" font-size="12">ospf, routes, bgp</text>
<rect x="385" y="60" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="440" y="88" text-anchor="middle" class="svg-ink" font-size="14">snap dict</text><text x="440" y="106" text-anchor="middle" class="svg-muted" font-size="12">memory mein</text>
<rect x="540" y="60" width="90" height="60" rx="10" fill="#bbf7d0"/><text x="585" y="88" text-anchor="middle" class="svg-ink" font-size="14">pre.json</text><text x="585" y="106" text-anchor="middle" class="svg-muted" font-size="12">disk par</text>
<line x1="145" y1="90" x2="195" y2="90" stroke="#64748b" stroke-width="2"/><line x1="335" y1="90" x2="385" y2="90" stroke="#64748b" stroke-width="2"/><line x1="495" y1="90" x2="540" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">json.dump dictionary ko file mein likhta hai</text>
</svg><p class="cap">Collect karo, dictionary mein rakho, JSON mein likho.</p></div>

<h3>snapshot.py ko samajhna</h3>
<pre class="code"><span class="c"># Reference code: snapshot.py ka core (helper show() chapter 3 se)</span>
import sys
import json

name = sys.argv[1]      <span class="c"># script ke naam ke baad type kiya shabd: "pre" ya "post"</span>
snap = {}               <span class="c"># khaali dictionary, har router ke liye ek entry</span>

for router, ip in ROUTERS.items():
    nbrs = {}
    for intf in show(ip, "show ip ospf neighbor")["interfaces"].values():
        for rid, n in intf["neighbors"].items():
            nbrs[rid] = n["state"]
    routes = sorted(show(ip, "show ip route")["routes"].keys())
    snap[router] = {"ospf": nbrs, "routes": routes}
    print(f"{router}: {len(nbrs)} OSPF neighbours, {len(routes)} routes")

peer = show(ROUTERS["R1"], "show ip bgp summary")["neighbors"]["203.0.113.2"]
snap["R1"]["bgp"] = peer["state"]

with open(name + ".json", "w") as f:
    json.dump(snap, f, indent=2)
print("saved", name + ".json")</pre>
<ul>
<li><code>sys.argv[1]</code> script ke naam ke baad type kiya pehla shabd hai, isliye ek script "pre" aur "post" dono sambhalti hai.</li>
<li><code>for</code> loop apna indented block har router ke liye ek baar chalata hai. <code>.items()</code> naam aur address saath deta hai.</li>
<li>Andar ke loops OSPF dictionary ghoomte hain: har interface, phir uske har neighbour.</li>
<li><code>sorted(...keys())</code> prefixes ko order mein rakhta hai taaki do snapshots barabari se compare ho sakein.</li>
<li><code>with open(..., "w") as f</code> file ko writing ke liye kholta hai aur baad mein surakshit band karta hai. <code>json.dump</code> dictionary ko text mein likhta hai; <code>indent=2</code> use padhne layak banata hai.</li>
</ul>

<h3>Chalane par kaisa dikhta hai</h3>
<p>Yeh lab network ka real output hai, kisi change se pehle:</p>
<pre class="out">AUTO&gt; python3 snapshot.py pre
R1: 1 OSPF neighbours, 12 routes
R2: 2 OSPF neighbours, 10 routes
R3: 1 OSPF neighbours, 9 routes
saved pre.json

AUTO&gt; jq '.R2.ospf' pre.json
{
  "1.1.1.1": "FULL/BDR",
  <span class="hl">"3.3.3.3": "FULL/DR"</span>
}</pre>
<p>R2 beech mein hai, isliye uske do neighbours hain; R1 aur R3 kinaron par hain aur ek-ek neighbour hai. <code>jq</code> chhota tool hai jo JSON file padhkar uska ek hissa print karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Sort aur JSON kyun? Maan lo R1 aaj routes alag order mein dikhata hai. Bina sort ke seedha compare kehta "sab badal gaya". Sort ke baad barabar tables barabar dikhte hain. JSON plain text hai, isliye editor mein khol sakte ho, Git (module auto-git) mein rakh sakte ho, aur change ticket mein saboot ki tarah laga sakte ho.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Hamesha badalne wali values save karna, jaise uptime, packet counters ya timers. Har diff mein changes dikhenge aur log report ko ignore karna seekh jayenge. Sirf stable facts save karo. Ek aur galti: change ke baad <code>snapshot.py pre</code> dobara chalakar pre.json overwrite kar dena; use sirf ek baar, pehle chalao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Snapshot ek moment ki state hai, configuration nahi. Config backup batata hai device ko kya bola gaya; state snapshot batata hai device kya kar raha hai. Dono kaam ke hain; exam poochh sakta hai kaunsa prove karta hai ki OSPF sach mein bana.</p></div>

<div class="scn"><h4>Snapshot jisne rollback ka faisla bachaya</h4><p>Deccan Net ke engineer ne change ke baad BGP down paaya aur sab kuch rollback karne wala tha. Pre snapshot ne dikhaya ki BGP change shuru hone se pehle hi Idle tha, yaani change nirdosh tha aur asli fault provider ka tha. Rollback cancel hua aur ticket carrier ko gaya.</p><p><b>Lesson:</b> pre snapshot batata hai galti kiski hai.</p></div>

<div class="iv"><p class="q">"Pre-change snapshot mein kya rakhoge aur kya chhodoge?"</p><p>Stable, meaningful state: neighbour states, route prefixes, interface status, BGP session state aur prefix counts. Counters, timers aur uptime jaise volatile data chhodo jo lagatar badalte hain aur diff ko bhar dete hain. JSON jaise structured format mein timestamp ke saath save karo aur change record ke saath rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Snapshot ek moment par save ki gayi state hai; change se pehle aur baad lo.</li>
<li>Stable facts save karo (neighbours, prefixes, session state), counters ya uptime nahi.</li>
<li>sys.argv se ek script pre.json ya post.json likh sakti hai.</li>
<li>Lists sort karo taaki barabar data barabar compare ho.</li>
<li>JSON files padhne, diff karne layak hain aur Git aur tickets mein fit hoti hain.</li>
</ul></div>
`}};export{e as default};