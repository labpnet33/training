var e=String.raw`<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Snapshot before, change, snapshot after">
<rect x="10" y="40" width="130" height="64" rx="8" fill="#ddd6fe"/><text x="75" y="66" text-anchor="middle" class="svg-ink" font-size="13">snapshot</text><text x="75" y="84" text-anchor="middle" class="svg-muted" font-size="11">before</text>
<rect x="170" y="40" width="130" height="64" rx="8" fill="#fde68a"/><text x="235" y="66" text-anchor="middle" class="svg-ink" font-size="13">change</text><text x="235" y="84" text-anchor="middle" class="svg-muted" font-size="11">session or api</text>
<rect x="330" y="40" width="130" height="64" rx="8" fill="#ddd6fe"/><text x="395" y="66" text-anchor="middle" class="svg-ink" font-size="13">snapshot</text><text x="395" y="84" text-anchor="middle" class="svg-muted" font-size="11">after</text>
<rect x="490" y="40" width="140" height="64" rx="8" fill="#bbf7d0"/><text x="560" y="66" text-anchor="middle" class="svg-ink" font-size="13">compare</text><text x="560" y="84" text-anchor="middle" class="svg-muted" font-size="11">only what you meant</text>
<line x1="140" y1="72" x2="170" y2="72" stroke="#64748b" stroke-width="2"/><line x1="300" y1="72" x2="330" y2="72" stroke="#64748b" stroke-width="2"/><line x1="460" y1="72" x2="490" y2="72" stroke="#64748b" stroke-width="2"/>
</svg></div>
<p class="cap">A change is finished when the second snapshot proves it, not when the setter returned True.</p>`,t=String.raw`<pre class="code"><span class="c"># snapshot.py (Lab 1, step 3) - what a leaf holds now</span>
import pyeapi


def snapshot(node):
    vlans = node.api("vlans").getall()
    summary = node.run_commands("show ip bgp summary")[0]
    peers = summary["vrfs"].get("default", {}).get("peers", {})
    return {"vlans": sorted(vlans, key=int),
            "peers": dict((ip, p["peerState"]) for ip, p in peers.items())}


if __name__ == "__main__":
    for name in ("leaf1", "leaf2"):
        print(name, snapshot(pyeapi.connect_to(name)))</pre>
<pre class="out">AUTO01$ python3 snapshot.py
leaf1 {'vlans': ['1'], 'peers': {}}
leaf2 {'vlans': ['1'], 'peers': {'10.1.2.1': <span class="hl">'Active'</span>}}
<span class="c"># ... run vlans.py and bgpnbr.py, then again:</span>
AUTO01$ python3 snapshot.py
leaf1 {'vlans': ['1', '110', '120', '130'], 'peers': {'10.1.2.2': <span class="hl">'Established'</span>}}
leaf2 {'vlans': ['1'], 'peers': {'10.1.2.1': 'Established'}}</pre>`,n=String.raw`<pre class="code"><span class="c"># d_fleet.py - the same question to every profile in parallel</span>
from concurrent.futures import ThreadPoolExecutor

import pyeapi


def facts(name):
    node = pyeapi.connect_to(name)
    return name, node.model, node.version, node.run_commands("show hostname")[0]["hostname"]


pyeapi.load_config()
names = sorted(pyeapi.client.config.connections)
with ThreadPoolExecutor(max_workers=4) as pool:
    for row in pool.map(facts, names):
        print(row)</pre>
<pre class="out">AUTO01$ python3 d_fleet.py
('leaf1', 'vEOS-lab', '4.31.4M', 'LEAF1')
('leaf2', 'vEOS-lab', '4.31.4M', 'LEAF2')</pre>`,r=String.raw`<pre class="code"><span class="c"># Real switches only. Not run in the lab: its clock does not move while a script runs.</span>
import time

def wait_established(node, peer, seconds=60):
    deadline = time.time() + seconds
    while time.time() < deadline:
        state = snapshot(node)["peers"].get(peer)
        if state == "Established":
            return True
        time.sleep(5)
    return False</pre>`,i={id:`verify-and-scale`,h:{en:`Verify, then scale: snapshots, idempotence and many switches`,hi:`Verify karo, phir scale: snapshots, idempotence aur kai switches`},body:{en:`
<p>A script that changes one switch is a demo. A script you can trust on fifty switches has three habits: it looks before it changes, it looks again afterwards, and it treats each switch separately. This chapter is Lab 1, step 3 and the part of step 5 that proves the BGP session.</p>

<h3>Look, change, look</h3>
`+e+`
<p>The snapshot is a small dictionary of the facts you care about: not the whole configuration, just the VLAN ids and the BGP peer states. A small snapshot is easy to print, easy to compare and quick to take.</p>
`+t+`
<ul>
<li>Before the change LEAF2 has a peer <code>10.1.2.1</code> in state <code>Active</code>, which means it is trying to connect and nobody answers. LEAF1 has no peer at all.</li>
<li>After, LEAF1 has the three VLANs and both ends say <code>Established</code>. That second snapshot is the proof.</li>
<li><code>summary["vrfs"].get("default", {})</code>: the <code>.get</code> with defaults means a switch with no BGP gives an empty dictionary instead of a <code>KeyError</code>.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> Verifying immediately and calling it a failure. BGP takes seconds to reach Established. On a real switch, poll with a limit.</p></div>
`+r+`
<div class="note"><p><b>In the lab vs on real gear.</b> The lab's network clock does not advance while one Python script runs, so a loop like this never sees the session come up. In the lab, run <code>snapshot.py</code> again as a second command, as the lab steps do. On a real switch the loop above is the right pattern.</p></div>

<h3>Idempotence is what makes it safe to re-run</h3>
<p>If <code>vlans.py</code> fails on the 30th switch, you want to run it again for everyone without worrying. It did: the second run in chapter 8 changed zero VLANs. Design every change as "make it so", not "do this": compare, apply the difference, report what changed.</p>

<h3>Many switches</h3>
<p>With profiles in <code>~/.eapi.conf</code> you can ask every switch at once. The threads wait for the network, so a pool of a few workers is a good fit.</p>
`+n+`
<ul>
<li>Each worker creates its own Node with <code>connect_to(name)</code>. Do not share one Node between threads.</li>
<li><code>pyeapi.load_config()</code> and <code>pyeapi.client.config.connections</code> list the names, so a new switch needs only a new profile, not a code change.</li>
<li><code>pool.map</code> keeps the order of the names. An exception in one worker is raised when you reach its row, so wrap the worker body in the try/except from chapter 5 to keep one bad switch from stopping the report.</li>
</ul>
<table class="cmp"><tr><th>Habit</th><th>Why</th></tr>
<tr><td>Small snapshot before and after</td><td>Proves the change and shows side effects</td></tr>
<tr><td>Compare first, change the difference</td><td>Second run is harmless</td></tr>
<tr><td>One Node per switch (and per thread)</td><td>No shared state to corrupt</td></tr>
<tr><td>Catch and report per switch</td><td>One failure must not hide the others</td></tr>
<tr><td>Small pool, with a timeout</td><td>Do not hit AAA or the management network all at once</td></tr></table>
<div class="exam"><p><b>Exam trap.</b> A switch that answers "refused" or "timed out" is not "done with no changes". Count failures separately and exit non-zero, so a scheduler sees the failure.</p></div>

<div class="scn"><h4>The change that looked fine</h4><p>A VLAN script reported "3 VLANs changed" on every leaf. A week later a new rack had no BGP. The script never took a snapshot, and one leaf's session was still <code>Active</code> because of a wrong remote AS in an older config. A before/after snapshot with peer states would have shown <code>Active</code> the same day.</p><p><b>Lesson:</b> prove the outcome you care about, not the command you sent.</p></div>

<div class="iv"><p class="q">"How do you make a network automation script safe to run on many devices?"</p><p>I make it idempotent: read the current state, compute the difference and apply only that. I stage risky changes in a config session and read the diff. I take a small snapshot before and after to prove the outcome, handle each device separately with explicit error handling, run a small thread pool, and exit non-zero if any device failed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Take a small snapshot before and after a change; the second one is the proof.</li>
<li>Compare first and change only the difference, so re-running is safe.</li>
<li>BGP needs time: poll with a limit on real gear; in the lab re-run the check as a separate command.</li>
<li>Use profiles, one Node per worker and a small thread pool for many switches.</li>
<li>Report failures per switch and exit non-zero if any switch failed.</li>
</ul></div>
`,hi:`
<p>Ek switch badalne wali script demo hai. Pachaas switches par bharosemand script ki teen aadatein hoti hain: badalne se pehle dekhti hai, baad mein phir dekhti hai, aur har switch ko alag maanti hai. Yeh chapter Lab 1 ka step 3 hai aur step 5 ka woh hissa jo BGP session sabit karta hai.</p>

<h3>Dekho, badlo, dekho</h3>
`+e+`
<p>Snapshot un facts ki chhoti dictionary hai jo aapko chahiye: poori configuration nahi, bas VLAN ids aur BGP peer states. Chhota snapshot print karna, compare karna aur lena aasaan hai.</p>
`+t+`
<ul>
<li>Change se pehle LEAF2 ke paas peer <code>10.1.2.1</code> state <code>Active</code> mein hai, yaani woh connect karne ki koshish kar raha hai aur koi jawab nahi de raha. LEAF1 ke paas koi peer nahi.</li>
<li>Baad mein LEAF1 ke paas teeno VLANs hain aur dono sire <code>Established</code> kehte hain. Woh doosra snapshot hi saboot hai.</li>
<li><code>summary["vrfs"].get("default", {})</code>: defaults wala <code>.get</code> matlab BGP-rahit switch <code>KeyError</code> ki jagah khaali dictionary deta hai.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> Turant verify karke use failure kehna. BGP ko Established hone mein kuch second lagte hain. Asli switch par limit ke saath poll karo.</p></div>
`+r+`
<div class="note"><p><b>Lab vs real gear.</b> Ek Python script ke chalte waqt lab ki network clock aage nahi badhti, isliye aisa loop session ko up hote kabhi nahi dekhta. Lab mein <code>snapshot.py</code> ko doosre command ki tarah dobara chalao, jaise lab steps karte hain. Asli switch par upar wala loop sahi pattern hai.</p></div>

<h3>Idempotence hi re-run ko surakshit banata hai</h3>
<p>Agar <code>vlans.py</code> 30ve switch par fail ho, to aap bina chinta sabke liye dobara chalana chahte ho. Yahi hua: chapter 8 ki doosri run ne zero VLANs badle. Har change ko "aisa kar do" ki jagah "aisa ho jaye" banao: compare, farq lagao, report karo kya badla.</p>

<h3>Kai switches</h3>
<p><code>~/.eapi.conf</code> ke profiles ke saath aap har switch se ek saath pooch sakte ho. Threads network ka intezaar karte hain, isliye kuch workers ka pool achha baithta hai.</p>
`+n+`
<ul>
<li>Har worker <code>connect_to(name)</code> se apna Node banata hai. Ek Node threads ke beech share mat karo.</li>
<li><code>pyeapi.load_config()</code> aur <code>pyeapi.client.config.connections</code> naam list karte hain, isliye naye switch ke liye sirf naya profile chahiye, code change nahi.</li>
<li><code>pool.map</code> naamon ka order rakhta hai. Ek worker ka exception tab raise hota hai jab aap uski row tak pahunchte ho, isliye worker body ko chapter 5 ke try/except mein lapeto taaki ek bura switch report na rok de.</li>
</ul>
<table class="cmp"><tr><th>Aadat</th><th>Kyun</th></tr>
<tr><td>Change se pehle aur baad chhota snapshot</td><td>Change sabit karta hai aur side effects dikhata hai</td></tr>
<tr><td>Pehle compare, farq badlo</td><td>Doosri run harmless</td></tr>
<tr><td>Har switch (aur thread) ka ek Node</td><td>Koi shared state bigadne ko nahi</td></tr>
<tr><td>Har switch par catch aur report</td><td>Ek failure baakiyon ko na chhupaye</td></tr>
<tr><td>Chhota pool, timeout ke saath</td><td>AAA ya management network par ek saath hamla nahi</td></tr></table>
<div class="exam"><p><b>Exam trap.</b> "Refused" ya "timed out" dene wala switch "done, no changes" nahi hai. Failures alag gino aur non-zero exit karo, taaki scheduler failure dekhe.</p></div>

<div class="scn"><h4>Jo change theek dikha</h4><p>Ek VLAN script har leaf par "3 VLANs changed" report karti rahi. Hafte baad naye rack mein BGP nahi tha. Script ne kabhi snapshot nahi liya, aur ek leaf ka session purani config ke galat remote AS ki wajah se <code>Active</code> tha. Peer states wala before/after snapshot usi din <code>Active</code> dikha deta.</p><p><b>Lesson:</b> woh outcome sabit karo jo aapko chahiye, woh command nahi jo bheja.</p></div>

<div class="iv"><p class="q">"Network automation script ko kai devices par surakshit kaise banate ho?"</p><p>Use idempotent banata hoon: current state padho, farq nikalo aur sirf wahi lagao. Risky changes config session mein stage karke diff padhta hoon. Change se pehle aur baad chhota snapshot leta hoon outcome sabit karne ke liye, har device ko alag explicit error handling se handle karta hoon, chhota thread pool chalata hoon, aur koi device fail ho to non-zero exit karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Change se pehle aur baad chhota snapshot lo; doosra saboot hai.</li>
<li>Pehle compare karo aur sirf farq badlo, taaki re-run surakshit rahe.</li>
<li>BGP ko samay chahiye: asli gear par limit ke saath poll; lab mein check ko alag command ki tarah dobara chalao.</li>
<li>Kai switches ke liye profiles, har worker ka ek Node aur chhota thread pool.</li>
<li>Failures har switch ke hisaab se report karo aur koi fail ho to non-zero exit karo.</li>
</ul></div>
`}};export{i as default};