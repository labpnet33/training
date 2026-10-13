var e={id:`split-brain-and-troubleshooting`,h:{en:`Split-brain risk and troubleshooting HA formation`,hi:`Split-brain ka risk aur HA formation troubleshooting`},body:{en:`
<p>Picture two night-shift supervisors who cannot reach each other by phone. Each assumes the other has gone home, so each starts giving orders to the same workers. This is the <b>split-brain</b> idea: two peers both believe they are active because neither can see the other. Workers (here, firewalls and administrators) then receive conflicting instructions and configuration can diverge.</p>

<h3>Where it comes from</h3>
<ul>
<li>A wrong or unreachable <code>peer-ip-address</code> on one or both sides.</li>
<li>The peers cannot reach each other on the management network.</li>
<li>Two peers with the <b>same priority</b>, so the election has no rule to follow.</li>
<li>The same configuration pasted on both sides, so a peer points at itself.</li>
</ul>
<p>Real deployments add protections and link details that the simulator does not model, such as dedicated HA links and heartbeat timers. For what your version does, check the documentation for your PAN-OS version.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Split-brain">
<rect x="30" y="30" width="200" height="60" rx="8" fill="#fde68a"/><text x="130" y="56" text-anchor="middle" class="svg-ink" font-size="12">Panorama A</text><text x="130" y="76" text-anchor="middle" class="svg-muted" font-size="11">thinks: I am active</text>
<rect x="410" y="30" width="200" height="60" rx="8" fill="#fde68a"/><text x="510" y="56" text-anchor="middle" class="svg-ink" font-size="12">Panorama B</text><text x="510" y="76" text-anchor="middle" class="svg-muted" font-size="11">thinks: I am active</text>
<line x1="230" y1="60" x2="300" y2="60" stroke="#64748b" stroke-width="2"/><line x1="340" y1="60" x2="410" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="20">X</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Each admin edits a different Panorama: configuration drifts</text>
</svg><p class="cap">When the peers cannot see each other both can claim to be active.</p></div>

<h3>A method: read, compare, fix one thing, re-read</h3>
<ol>
<li>Run <code>show high-availability state</code> on <b>both</b> peers. Never only one.</li>
<li>Read the peer information line. It tells you what each side thinks about the other.</li>
<li>Compare: each peer address must be the other's management IP. Priorities must differ. Both must be enabled.</li>
<li>Fix one thing, commit, read again. Repeat.</li>
<li>Prove synchronization afterwards, not only the states.</li>
</ol>

<h3>Symptom to cause</h3>
<table class="tbl">
<tr><th>What the output says (lab wording)</th><th>Likely cause</th></tr>
<tr><td>Peer state unknown, no Panorama answers on the address</td><td>Peer address is wrong or the other box is not there</td></tr>
<tr><td>Peer state unknown, peer points at a different address, not at this Panorama</td><td>The OTHER side has a wrong peer address</td></tr>
<tr><td>Both claim active, synchronization: peer not available</td><td>Neither sees the other: address mistakes</td></tr>
<tr><td>non-functional or a priority complaint</td><td>Same priority or priority missing</td></tr>
<tr><td>HA is not enabled</td><td>HA never turned on or not committed</td></tr>
</table>

<pre class="out">&gt; show high-availability state          (made-up example, not a lab answer)
  Local Information:
    Management IP    : 192.0.2.50
    State            : active-primary
  Peer Information:
    Management IP    : 192.0.2.5
    <span class="hl">State            : unknown (no Panorama answers on 192.0.2.5)</span>
  Configuration synchronization: peer not available</pre>
<p>Notice how the message names the problem: it says which address was tried. Always read the sentence in brackets. A typo in the last octet is far more common than a network fault, so compare the address against your plan first.</p>

<div class="warn"><p>Do not "fix" a pair by committing different shared changes on both peers while they cannot see each other. After they reconnect you will have to decide which configuration wins, and one set of changes will be lost.</p></div>

<div class="scn"><h4>Two actives for an hour</h4><p>An HA pair formed wrongly after a window. Two engineers worked in parallel, each on a different Panorama, each believing it was the live one. After the pair was corrected only the configuration of the surviving active peer was kept, and one engineer's afternoon of work had to be redone from his notes.</p><p><b>Lesson:</b> check the state on a peer before editing, and fix formation before making any other change.</p></div>

<div class="iv"><p class="q">"Two Panoramas both show active. What now?"</p><p>I treat it as a formation problem, not as a policy problem. I stop changes, read the state on both peers, compare peer addresses, priorities and enablement, and test management reachability. I fix one cause at a time, then confirm one active, one passive and a synchronized line. If different changes were made on each side, I decide which configuration wins and note what must be redone.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Split-brain means both peers think they are active.</li>
<li>Causes: wrong peer address, no reachability, same priority.</li>
<li>Read the state on both peers and read the bracketed message.</li>
<li>Freeze changes until the pair is correct.</li>
</ul></div>
`,hi:`
<p>Do night-shift supervisors socho jo phone par ek doosre ko nahi pa rahe. Har ek maan leta hai ki doosra ghar chala gaya, to dono same workers ko orders dene lagte hain. Yeh <b>split-brain</b> idea hai: do peers dono maante hain ki woh active hain kyunki koi doosre ko dekh nahi pa raha. Workers (yahan firewalls aur administrators) ko conflicting instructions milti hain aur configuration diverge ho sakti hai.</p>

<h3>Yeh kahan se aata hai</h3>
<ul>
<li>Ek ya dono side <code>peer-ip-address</code> galat ya unreachable.</li>
<li>Peers management network par ek doosre ko reach nahi kar sakte.</li>
<li>Do peers ki <b>same priority</b>, to election ke paas follow karne ka rule nahi.</li>
<li>Dono side same configuration paste ho gayi, to peer khud ko point karta hai.</li>
</ul>
<p>Real deployments mein protections aur link details hote hain jo simulator model nahi karta, jaise dedicated HA links aur heartbeat timers. Aapka version kya karta hai, uske liye apne PAN-OS version ki documentation check karo.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Split-brain">
<rect x="30" y="30" width="200" height="60" rx="8" fill="#fde68a"/><text x="130" y="56" text-anchor="middle" class="svg-ink" font-size="12">Panorama A</text><text x="130" y="76" text-anchor="middle" class="svg-muted" font-size="11">sochta hai: main active hoon</text>
<rect x="410" y="30" width="200" height="60" rx="8" fill="#fde68a"/><text x="510" y="56" text-anchor="middle" class="svg-ink" font-size="12">Panorama B</text><text x="510" y="76" text-anchor="middle" class="svg-muted" font-size="11">sochta hai: main active hoon</text>
<line x1="230" y1="60" x2="300" y2="60" stroke="#64748b" stroke-width="2"/><line x1="340" y1="60" x2="410" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="20">X</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Har admin alag Panorama edit karta hai: configuration drift</text>
</svg><p class="cap">Peers ek doosre ko dekh na paayein to dono active hone ka claim kar sakte hain.</p></div>

<h3>Method: padho, compare karo, ek cheez fix karo, dobara padho</h3>
<ol>
<li><b>Dono</b> peers par <code>show high-availability state</code> chalao. Sirf ek par kabhi nahi.</li>
<li>Peer information line padho. Woh batati hai ki har side doosre ke baare mein kya sochti hai.</li>
<li>Compare karo: har peer address doosre ka management IP hona chahiye. Priorities alag honi chahiye. Dono enabled hon.</li>
<li>Ek cheez fix karo, commit karo, dobara padho. Repeat.</li>
<li>Baad mein synchronization prove karo, sirf states nahi.</li>
</ol>

<h3>Symptom se cause</h3>
<table class="tbl">
<tr><th>Output kya kehta hai (lab wording)</th><th>Likely cause</th></tr>
<tr><td>Peer state unknown, us address par koi Panorama answer nahi karta</td><td>Peer address galat hai ya doosra box wahan nahi hai</td></tr>
<tr><td>Peer state unknown, peer kisi aur address ko point karta hai, is Panorama ko nahi</td><td>DOOSRI side ka peer address galat hai</td></tr>
<tr><td>Dono active claim, synchronization: peer not available</td><td>Koi doosre ko nahi dekhta: address mistakes</td></tr>
<tr><td>non-functional ya priority complaint</td><td>Same priority ya priority missing</td></tr>
<tr><td>HA is not enabled</td><td>HA kabhi on nahi hua ya commit nahi hua</td></tr>
</table>

<pre class="out">&gt; show high-availability state          (made-up example, lab answer nahi)
  Local Information:
    Management IP    : 192.0.2.50
    State            : active-primary
  Peer Information:
    Management IP    : 192.0.2.5
    <span class="hl">State            : unknown (no Panorama answers on 192.0.2.5)</span>
  Configuration synchronization: peer not available</pre>
<p>Dekho message problem ka naam kaise batata hai: kaun sa address try hua. Bracket wala sentence hamesha padho. Last octet ka typo network fault se kahin zyada common hai, isliye pehle address ko apne plan se compare karo.</p>

<div class="warn"><p>Pair ko "fix" karne ke liye jab peers ek doosre ko nahi dekh rahe, dono par alag shared changes commit mat karo. Reconnect hone ke baad aapko decide karna padega kaun si configuration jeete, aur ek set ke changes lost honge.</p></div>

<div class="scn"><h4>Ek ghante tak do actives</h4><p>Window ke baad HA pair galat bana. Do engineers parallel kaam karte rahe, har ek alag Panorama par, har ek ko lagta tha ki wahi live hai. Pair sahi hone ke baad sirf bache hue active peer ki configuration rakhi gayi, aur ek engineer ki dopahar ka kaam apne notes se dobara karna pada.</p><p><b>Lesson:</b> edit se pehle peer par state check karo, aur koi bhi aur change karne se pehle formation fix karo.</p></div>

<div class="iv"><p class="q">"Do Panorama dono active dikha rahe hain. Ab kya?"</p><p>Ise policy problem nahi, formation problem maanta hoon. Changes rokta hoon, dono peers par state padhta hoon, peer addresses, priorities aur enablement compare karta hoon, aur management reachability test karta hoon. Ek cause ek baar fix karta hoon, phir confirm karta hoon ek active, ek passive aur synchronized line. Agar dono side alag changes hue the, to decide karta hoon kaun si configuration jeete aur kya redo karna hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Split-brain matlab dono peers sochte hain ki woh active hain.</li>
<li>Causes: galat peer address, reachability nahi, same priority.</li>
<li>Dono peers par state padho aur bracket message padho.</li>
<li>Pair sahi hone tak changes freeze karo.</li>
</ul></div>
`}};export{e as default};