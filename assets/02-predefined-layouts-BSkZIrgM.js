var e={id:`predefined-layouts`,h:{en:`The three predefined report layouts`,hi:`Teen predefined report layouts`},body:{en:`
<p>Imagine three printed forms kept in a drawer of the head office. One form is titled "Visitors", one "Incidents", one "Heavy users". You do not design the form each time; you pick the right one and fill it with this month's data. A <b>report layout</b> is such a form: it fixes which numbers are counted and how they are grouped. The simulator on FAZ-1 has exactly three layouts. In the real product there are many predefined templates and you can design your own; that part is theory and chapter 5 covers it.</p>

<h3>The three layouts</h3>
<table class="cmp"><tr><th>Layout</th><th>Reads</th><th>Main numbers</th><th>Best reader</th></tr>
<tr><td>Traffic Report</td><td>Traffic logs, plus UTM verdicts</td><td>Sessions, bytes, blocked, per action, top sources, destinations, services, policies, applications</td><td>Store manager, auditor</td></tr>
<tr><td>Threat Report</td><td>UTM logs</td><td>Threat events, blocked, per security feature, per action, top threats, attacks, viruses, sources, destinations, hostnames</td><td>Security officer</td></tr>
<tr><td>Bandwidth and Applications</td><td>Traffic logs</td><td>Sessions, bytes, top applications by bytes, categories, top sources by bytes</td><td>Network engineer</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Which logs feed which layout">
<rect x="20" y="20" width="150" height="56" rx="8" fill="#bae6fd"/><text x="95" y="44" text-anchor="middle" class="svg-ink" font-size="13">Traffic logs</text><text x="95" y="62" text-anchor="middle" class="svg-muted" font-size="12">one per session</text>
<rect x="20" y="124" width="150" height="56" rx="8" fill="#fed7aa"/><text x="95" y="148" text-anchor="middle" class="svg-ink" font-size="13">UTM logs</text><text x="95" y="166" text-anchor="middle" class="svg-muted" font-size="12">app, IPS, web, AV</text>
<rect x="380" y="10" width="240" height="40" rx="8" fill="#bbf7d0"/><text x="500" y="35" text-anchor="middle" class="svg-ink" font-size="13">Traffic Report</text>
<rect x="380" y="80" width="240" height="40" rx="8" fill="#fde68a"/><text x="500" y="105" text-anchor="middle" class="svg-ink" font-size="13">Bandwidth and Applications</text>
<rect x="380" y="150" width="240" height="40" rx="8" fill="#ddd6fe"/><text x="500" y="175" text-anchor="middle" class="svg-ink" font-size="13">Threat Report</text>
<line x1="170" y1="40" x2="380" y2="30" stroke="#64748b" stroke-width="2"/><line x1="170" y1="52" x2="380" y2="98" stroke="#64748b" stroke-width="2"/><line x1="170" y1="150" x2="380" y2="170" stroke="#64748b" stroke-width="2"/><line x1="170" y1="138" x2="380" y2="40" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="250" y="22" class="svg-muted" font-size="12">dashed: UTM verdict feeds "blocked"</text>
</svg><p class="cap">Event logs feed none of the three layouts; they are for Log View and handlers.</p></div>

<h3>Traffic Report in detail</h3>
<p>It counts the <b>sessions</b>, that is, the traffic logs, and adds the bytes written in those logs. It splits sessions per <b>action</b> (the firewall's decision, accept or deny) and lists the top sources, destinations, services, policies and applications. Its <b>Blocked</b> number is wider than "deny": a session counts as blocked when the action was deny, or when a security profile gave a block or reset verdict on it.</p>

<h3>Threat Report in detail</h3>
<p>It counts <b>threat events</b>, which are UTM logs: an application control block, an IPS hit, an antivirus detection or a web filter block. It shows how many were blocked, how they split per security feature, and the top threats, sources and destinations. It also prints the number of denied sessions found in traffic logs, so a plain firewall deny is not lost.</p>

<h3>Bandwidth and Applications in detail</h3>
<p>It answers "who and what uses the link". Applications are ranked by <b>bytes</b>, not by session count, together with their categories. Sessions that no security profile looked at appear as <code>unscanned/ALL</code>, because no application was identified.</p>

<div class="eg"><p><b>Worked example.</b> Madurai's manager wants to know which program eats the link, so you choose Bandwidth and Applications for MDU-FGT, not the Threat Report. Security wants to see what the application control list blocked, so they get the Threat Report. Both pages come from the same logs; the layout decides the question.</p></div>

<h3>Commands and real output</h3>
<p>The layout name goes in double quotes because it has spaces. The dash means all devices of the ADOM.</p>
<pre class="code"><span class="c">! stand-in for the GUI report run</span>
FAZ-1 # execute fazui report run root TRY-FGT "Threat Report"
FAZ-1 # execute fazui report run root - "Bandwidth and Applications"</pre>
<p>This is the real simulator output for TRY-FGT after five web sessions and two file-sharing attempts.</p>
<pre class="out">Report: Threat Report   ADOM: root   Device: TRY-FGT
Based on 9 stored analytics logs (7 traffic, 2 utm, 0 event).
<span class="hl">Threat events: 2   Blocked: 2   Denied sessions (traffic logs): 0</span>
By security feature: app-ctrl=2
Per action: block=2
Top threats:
  1. BitTorrent  (2)</pre>
<pre class="out">Report: Bandwidth and Applications   ADOM: root   Device: TRY-FGT
Top applications (by bytes):
  1. H&#84;TP.BROWSER  420 bytes, 5 sessions
  2. BitTorrent  168 bytes, 2 sessions
Application categories: P2P=2 Web.Client=5</pre>

<div class="warn"><p><b>Common mistakes.</b> Typing the layout name without quotes. Using the Threat Report to count all sessions: it counts UTM events, not sessions. Using an invented layout name; an unknown name is refused and the three valid names are listed.</p></div>

<div class="exam"><p><b>Exam traps.</b> Traffic Report ranks by sessions, Bandwidth and Applications ranks by bytes. "Blocked" in the Traffic Report is not only deny. In the simulator there are three layouts; custom layouts exist only in the real product.</p></div>

<div class="scn"><h4>Two reports, one Monday meeting</h4><p>At the Monday meeting the security officer showed the Threat Report: two blocked file-sharing sessions at Trichy. The network engineer showed Bandwidth and Applications: browsing used 420 bytes against 168 for the blocked client. Nobody argued, because each page answered a different question from the same nine stored logs.</p><p><b>Lesson:</b> pick the layout that matches the question before you run it.</p></div>

<div class="iv"><p class="q">"Which report would you give a network engineer who plans a link upgrade?"</p><p>A bandwidth and applications view, ranked by bytes, because link size depends on volume and not on the number of sessions. Mention the threat view for security and that the layout choice follows the reader's question.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The simulator has three layouts: Traffic Report, Threat Report, Bandwidth and Applications.</li>
<li>Traffic Report counts sessions; Threat Report counts UTM threat events.</li>
<li>Bandwidth and Applications ranks applications by bytes.</li>
<li>Layout names with spaces go in double quotes; a dash means all devices.</li>
<li>Custom layouts are real-product theory, not simulated.</li>
</ul></div>
`,hi:`
<p>Socho head office ki drawer mein teen printed forms rakhe hain. Ek ka title "Visitors", ek ka "Incidents", ek ka "Heavy users". Aap har baar form design nahi karte; sahi form chunte ho aur is mahine ka data bharte ho. <b>Report layout</b> aisa hi form hai: ye tay karta hai ki kaun se numbers count honge aur kaise group honge. FAZ-1 ke simulator mein theek teen layouts hain. Real product mein bahut saare predefined templates hote hain aur aap apna bhi design kar sakte ho; wo theory hai aur chapter 5 mein aayegi.</p>

<h3>Teen layouts</h3>
<table class="cmp"><tr><th>Layout</th><th>Kya padhta hai</th><th>Main numbers</th><th>Best reader</th></tr>
<tr><td>Traffic Report</td><td>Traffic logs, aur UTM verdicts</td><td>Sessions, bytes, blocked, per action, top sources, destinations, services, policies, applications</td><td>Store manager, auditor</td></tr>
<tr><td>Threat Report</td><td>UTM logs</td><td>Threat events, blocked, per security feature, per action, top threats, attacks, viruses, sources, destinations, hostnames</td><td>Security officer</td></tr>
<tr><td>Bandwidth and Applications</td><td>Traffic logs</td><td>Sessions, bytes, bytes ke hisaab se top applications, categories, bytes ke hisaab se top sources</td><td>Network engineer</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Kaun se logs kaun si layout ko feed karte hain">
<rect x="20" y="20" width="150" height="56" rx="8" fill="#bae6fd"/><text x="95" y="44" text-anchor="middle" class="svg-ink" font-size="13">Traffic logs</text><text x="95" y="62" text-anchor="middle" class="svg-muted" font-size="12">har session ka ek</text>
<rect x="20" y="124" width="150" height="56" rx="8" fill="#fed7aa"/><text x="95" y="148" text-anchor="middle" class="svg-ink" font-size="13">UTM logs</text><text x="95" y="166" text-anchor="middle" class="svg-muted" font-size="12">app, IPS, web, AV</text>
<rect x="380" y="10" width="240" height="40" rx="8" fill="#bbf7d0"/><text x="500" y="35" text-anchor="middle" class="svg-ink" font-size="13">Traffic Report</text>
<rect x="380" y="80" width="240" height="40" rx="8" fill="#fde68a"/><text x="500" y="105" text-anchor="middle" class="svg-ink" font-size="13">Bandwidth and Applications</text>
<rect x="380" y="150" width="240" height="40" rx="8" fill="#ddd6fe"/><text x="500" y="175" text-anchor="middle" class="svg-ink" font-size="13">Threat Report</text>
<line x1="170" y1="40" x2="380" y2="30" stroke="#64748b" stroke-width="2"/><line x1="170" y1="52" x2="380" y2="98" stroke="#64748b" stroke-width="2"/><line x1="170" y1="150" x2="380" y2="170" stroke="#64748b" stroke-width="2"/><line x1="170" y1="138" x2="380" y2="40" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="250" y="22" class="svg-muted" font-size="12">dashed: UTM verdict "blocked" ko feed karta hai</text>
</svg><p class="cap">Event logs teeno layouts mein nahi aate; wo Log View aur handlers ke liye hain.</p></div>

<h3>Traffic Report detail mein</h3>
<p>Ye <b>sessions</b> ginta hai, matlab traffic logs, aur un logs mein likhe bytes jodta hai. Sessions ko <b>action</b> (firewall ka decision, accept ya deny) ke hisaab se baantta hai aur top sources, destinations, services, policies aur applications deta hai. Iska <b>Blocked</b> number "deny" se bada hai: session blocked tab gina jata hai jab action deny ho, ya jab security profile ne us par block ya reset verdict diya ho.</p>

<h3>Threat Report detail mein</h3>
<p>Ye <b>threat events</b> ginta hai, yaani UTM logs: application control block, IPS hit, antivirus detection ya web filter block. Ye dikhata hai kitne blocked the, security feature ke hisaab se kaise baante, aur top threats, sources aur destinations. Ye traffic logs mein mile denied sessions ki sankhya bhi print karta hai, taaki seedha firewall deny kho na jaye.</p>

<h3>Bandwidth and Applications detail mein</h3>
<p>Ye jawab deta hai "link kaun aur kya use karta hai". Applications ko <b>bytes</b> se rank kiya jata hai, session count se nahi, categories ke saath. Jin sessions ko kisi security profile ne dekha hi nahi wo <code>unscanned/ALL</code> dikhte hain, kyunki koi application identify nahi hui.</p>

<div class="eg"><p><b>Worked example.</b> Madurai ka manager jaanna chahta hai ki kaun sa program link kha raha hai, to aap MDU-FGT ke liye Bandwidth and Applications chunte ho, Threat Report nahi. Security dekhna chahti hai application control list ne kya block kiya, unhe Threat Report milti hai. Dono pages same logs se aate hain; layout sawal tay karti hai.</p></div>

<h3>Commands aur real output</h3>
<p>Layout ka naam double quotes mein jaata hai kyunki usme spaces hain. Dash ka matlab ADOM ke saare devices.</p>
<pre class="code"><span class="c">! GUI report run ka stand-in</span>
FAZ-1 # execute fazui report run root TRY-FGT "Threat Report"
FAZ-1 # execute fazui report run root - "Bandwidth and Applications"</pre>
<p>Ye TRY-FGT ka real simulator output hai, paanch web sessions aur do file-sharing attempts ke baad.</p>
<pre class="out">Report: Threat Report   ADOM: root   Device: TRY-FGT
Based on 9 stored analytics logs (7 traffic, 2 utm, 0 event).
<span class="hl">Threat events: 2   Blocked: 2   Denied sessions (traffic logs): 0</span>
By security feature: app-ctrl=2
Per action: block=2
Top threats:
  1. BitTorrent  (2)</pre>
<pre class="out">Report: Bandwidth and Applications   ADOM: root   Device: TRY-FGT
Top applications (by bytes):
  1. H&#84;TP.BROWSER  420 bytes, 5 sessions
  2. BitTorrent  168 bytes, 2 sessions
Application categories: P2P=2 Web.Client=5</pre>

<div class="warn"><p><b>Common mistakes.</b> Layout naam bina quotes ke type karna. Saare sessions ginne ke liye Threat Report use karna: wo UTM events ginti hai, sessions nahi. Banaya hua layout naam use karna; unknown naam refuse hota hai aur teen valid naam list hote hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> Traffic Report sessions se rank karta hai, Bandwidth and Applications bytes se. Traffic Report ka "Blocked" sirf deny nahi hai. Simulator mein teen layouts hain; custom layouts sirf real product mein hote hain.</p></div>

<div class="scn"><h4>Do reports, ek Monday meeting</h4><p>Monday meeting mein security officer ne Threat Report dikhayi: Trichy mein do blocked file-sharing sessions. Network engineer ne Bandwidth and Applications dikhayi: browsing ne 420 bytes use kiye, blocked client ke 168 ke saamne. Kisi ne bahes nahi ki, kyunki har page ne un hi nau stored logs se alag sawal ka jawab diya.</p><p><b>Lesson:</b> run karne se pehle wo layout chuno jo sawal se match kare.</p></div>

<div class="iv"><p class="q">"Link upgrade plan karne wale network engineer ko aap kaun si report doge?"</p><p>Bandwidth aur applications view, bytes se ranked, kyunki link ka size volume par depend karta hai, sessions ki sankhya par nahi. Security ke liye threat view mention karo aur ye ki layout ka chunav reader ke sawal se tay hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Simulator mein teen layouts hain: Traffic Report, Threat Report, Bandwidth and Applications.</li>
<li>Traffic Report sessions ginti hai; Threat Report UTM threat events.</li>
<li>Bandwidth and Applications applications ko bytes se rank karti hai.</li>
<li>Spaces wale layout naam double quotes mein; dash ka matlab saare devices.</li>
<li>Custom layouts real-product theory hain, simulated nahi.</li>
</ul></div>
`}};export{e as default};