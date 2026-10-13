var e={id:`security-fabric`,h:{en:`FortiAnalyzer in the Security Fabric with FortiGate and FortiManager`,hi:`Security Fabric mein FortiAnalyzer, FortiGate aur FortiManager ke saath`},body:{en:`
<p>Picture a hospital. The wards treat patients (the FortiGates). The records office keeps the files and finds old ones (the FortiAnalyzer). The administration office decides policy and sends the same instructions to every ward (the FortiManager). Three departments, three jobs, and a patient registered with administration is not automatically in the records office. People who forget this are surprised that a "managed" device has no logs. This chapter is about how the three fit together. It is mostly <b>theory</b>: the Security Fabric views are not modelled, and the FortiManager is absent from the labs of this track.</p>

<h3>The three roles</h3>
<table class="cmp"><tr><th>System</th><th>Job</th><th>Talks to the FortiGate over</th><th>Key setting on the FortiGate</th></tr>
<tr><td>FortiGate</td><td>Forwards traffic, writes logs</td><td>-</td><td>Firewall policies, <code>logtraffic</code></td></tr>
<tr><td>FortiAnalyzer</td><td>Stores logs, searches, events, reports</td><td>OFTP, port 514 (UDP, or TCP with <code>reliable</code>)</td><td><code>config log fortianalyzer setting</code></td></tr>
<tr><td>FortiManager</td><td>Holds intended configuration, installs it</td><td>FGFM, TCP 541</td><td><code>config system central-management</code></td></tr></table>
<p>Two different tunnels, two different settings, two different device lists. That is the whole point of the chapter.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="FortiGate with FortiManager and FortiAnalyzer">
<rect x="40" y="14" width="160" height="56" rx="8" fill="#ddd6fe"/><text x="120" y="38" text-anchor="middle" class="svg-ink" font-size="13">FMG-1</text><text x="120" y="56" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.5 policy</text>
<rect x="440" y="14" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="520" y="38" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text><text x="520" y="56" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.6 logs</text>
<rect x="240" y="150" width="160" height="56" rx="8" fill="#bae6fd"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.11</text>
<line x1="120" y1="70" x2="290" y2="150" stroke="#64748b" stroke-width="2"/><line x1="520" y1="70" x2="350" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="120" y="118" class="svg-accent" font-size="12">FGFM TCP 541</text><text x="430" y="118" class="svg-accent" font-size="12">OFTP port 514</text>
<text x="215" y="40" class="svg-muted" font-size="12">no link needed between</text><text x="225" y="56" class="svg-muted" font-size="12">FMG and FAZ in the labs</text>
</svg><p class="cap">Two independent paths from the FortiGate. Authorizing on one does not create an entry on the other.</p></div>

<h3>Authorized in FortiManager is not registered in FortiAnalyzer</h3>
<p>This is the fact the lab tests. In the FortiManager track you learned that a FortiGate becomes managed when you authorize it in an ADOM. That creates a row in the FortiManager device database. It creates nothing on FAZ-1. Likewise registering a FortiGate on FAZ-1 does not make FortiManager manage it. Each system has its own table and its own ADOMs, even when the names look alike.</p>
<pre class="code"><span class="c">! FortiManager side: the sibling track</span>
config system central-management
    set type fortimanager
    set fmg 192.0.2.5
end
<span class="c">! FortiAnalyzer side: this track</span>
config log fortianalyzer setting
    set status enable
    set server 192.0.2.6
end</pre>
<p>A complete onboarding of a new site therefore has a line in each system. A ticket that says "the new FortiGate is in the fabric" needs one question back: which fabric, which table?</p>
<pre class="out">FAZ-1 # execute fazui unregistered list
Unregistered devices (connected through OFTP/514, logs are discarded until they are registered):
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
<span class="hl">HQ-FGT          FGVMEV1RGF38I000    192.0.2.11      5               2026-10-12 20:28:01</span></pre>
<p>This is a FortiGate that is connected and perhaps managed elsewhere, but unknown to FAZ-1. Its logs are discarded.</p>

<h3>The Security Fabric (theory)</h3>
<p>The <b>Security Fabric</b> is the Fortinet idea of connecting FortiGates and other products so that they share information. In a fabric, a root FortiGate leads the others and a FortiAnalyzer receives the logs of all of them, which allows topology views and a combined picture. The real product has a special ADOM type for fabric devices and dashboards such as FortiView. The simulator has none of this: no Security Fabric ADOM, no FortiView, no topology view. Know three sentences: the fabric shares information; the FortiAnalyzer is the logging and reporting member; the FortiManager is the configuration member.</p>

<h3>Co-location and playbooks (theory)</h3>
<p>Some FortiManager versions can carry FortiAnalyzer features in the same box, and a FortiAnalyzer can start automated responses and hand incidents to a SOAR tool (FortiSOAR). The simulator models none of this; the incident workflow of the events module is the basic form only.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri adds a Salem FortiGate. Checklist with two columns. FortiManager column: central-management set, authorized in the ADOM Kaveri, policy package installed. FortiAnalyzer column: logging set to 192.0.2.6 with the serial, registered in an ADOM, a test log found. The project is done when both columns have ticks. A common failure is a site with only the left column ticked: managed, patched, and invisible in every report.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Assuming that FortiManager authorization sends logs to FortiAnalyzer. Searching FAZ-1 for a device that exists only in FortiManager. Using the same ADOM name in both and assuming they are one object. Promising "fabric topology" to a customer when the lab can only show logs, events, incidents and reports.</p></div>

<div class="exam"><p><b>Exam traps.</b> FGFM is TCP 541 and belongs to FortiManager; the log path is OFTP on 514 and belongs to FortiAnalyzer. Authorizing in FortiManager does not register in FortiAnalyzer. Security Fabric ADOM and FortiView are theory in this course.</p></div>

<div class="scn"><h4>Managed but invisible</h4><p>A new branch FortiGate had been authorized in FortiManager and received its policy package. Two weeks later the security manager asked for its denied traffic and FAZ-1 had nothing. The device had never been pointed at the FortiAnalyzer, so there was no connection and no entry. After the logging setting and the registration, the first logs appeared. The two weeks of branch traffic could not be recovered.</p><p><b>Lesson:</b> make "managed" and "logging" two separate lines on every onboarding checklist.</p></div>

<div class="iv"><p class="q">"How do FortiGate, FortiManager and FortiAnalyzer work together?"</p><p>The FortiGate enforces policy and writes logs. FortiManager holds the intended configuration and pushes it over FGFM on TCP 541. FortiAnalyzer receives logs over OFTP on 514 and gives search, events and reports. They are independent: a device must be added to each. Mention the Security Fabric as the umbrella for information sharing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiManager manages configuration (FGFM, TCP 541); FortiAnalyzer collects logs (OFTP, port 514).</li>
<li>Authorizing a device in FortiManager does not register it in FortiAnalyzer, and the reverse is also true.</li>
<li>Every new site needs a line in each system's onboarding checklist.</li>
<li>Security Fabric topology, fabric ADOM, FortiView and co-location are theory here.</li>
<li>For the FortiManager side of the story, use the FortiManager track of this course.</li>
</ul></div>
`,hi:`
<p>Ek hospital socho. Wards patients ka ilaaj karte hain (FortiGates). Records office files rakhta hai aur purani files dhoondhta hai (FortiAnalyzer). Administration office policy tay karta hai aur har ward ko wahi instructions bhejta hai (FortiManager). Teen departments, teen jobs, aur jo patient administration mein registered hai wo apne aap records office mein nahi hota. Jo log ye bhool jaate hain wo hairaan hote hain ki "managed" device ke logs kyun nahi hain. Ye chapter batata hai ki teeno kaise jud-te hain. Zyada hissa <b>theory</b> hai: Security Fabric views model nahi hain, aur is track ke labs mein FortiManager absent hai.</p>

<h3>Teen roles</h3>
<table class="cmp"><tr><th>System</th><th>Job</th><th>FortiGate se baat karta hai</th><th>FortiGate par key setting</th></tr>
<tr><td>FortiGate</td><td>Traffic forward karta hai, logs likhta hai</td><td>-</td><td>Firewall policies, <code>logtraffic</code></td></tr>
<tr><td>FortiAnalyzer</td><td>Logs store, search, events, reports</td><td>OFTP, port 514 (UDP, ya <code>reliable</code> ke saath TCP)</td><td><code>config log fortianalyzer setting</code></td></tr>
<tr><td>FortiManager</td><td>Intended configuration rakhta aur install karta hai</td><td>FGFM, TCP 541</td><td><code>config system central-management</code></td></tr></table>
<p>Do alag tunnels, do alag settings, do alag device lists. Chapter ka poora point yahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="FortiGate, FortiManager aur FortiAnalyzer">
<rect x="40" y="14" width="160" height="56" rx="8" fill="#ddd6fe"/><text x="120" y="38" text-anchor="middle" class="svg-ink" font-size="13">FMG-1</text><text x="120" y="56" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.5 policy</text>
<rect x="440" y="14" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="520" y="38" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text><text x="520" y="56" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.6 logs</text>
<rect x="240" y="150" width="160" height="56" rx="8" fill="#bae6fd"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.11</text>
<line x1="120" y1="70" x2="290" y2="150" stroke="#64748b" stroke-width="2"/><line x1="520" y1="70" x2="350" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="120" y="118" class="svg-accent" font-size="12">FGFM TCP 541</text><text x="430" y="118" class="svg-accent" font-size="12">OFTP port 514</text>
<text x="215" y="40" class="svg-muted" font-size="12">labs mein FMG aur FAZ ke</text><text x="225" y="56" class="svg-muted" font-size="12">beech link nahi chahiye</text>
</svg><p class="cap">FortiGate se do independent raaste. Ek par authorize karne se doosre par entry nahi banti.</p></div>

<h3>FortiManager mein authorized ka matlab FortiAnalyzer mein registered nahi</h3>
<p>Lab yahi fact test karta hai. FortiManager track mein aapne seekha ki FortiGate tab managed hota hai jab use ADOM mein authorize karte ho. Isse FortiManager device database mein row banti hai. FAZ-1 par kuch nahi banta. Isi tarah FAZ-1 par FortiGate register karne se FortiManager use manage nahi karne lagta. Har system ki apni table aur apne ADOMs hain, chahe naam milte-julte dikhein.</p>
<pre class="code"><span class="c">! FortiManager side: sibling track</span>
config system central-management
    set type fortimanager
    set fmg 192.0.2.5
end
<span class="c">! FortiAnalyzer side: ye track</span>
config log fortianalyzer setting
    set status enable
    set server 192.0.2.6
end</pre>
<p>Naye site ka poora onboarding isliye har system mein ek line maangta hai. "Naya FortiGate fabric mein hai" wale ticket par ek sawal wapas poochna chahiye: kaun sa fabric, kaun si table?</p>
<pre class="out">FAZ-1 # execute fazui unregistered list
Unregistered devices (connected through OFTP/514, logs are discarded until they are registered):
NAME            SERIAL              IP              LOGS DISCARDED  LAST LOG SEEN
<span class="hl">HQ-FGT          FGVMEV1RGF38I000    192.0.2.11      5               2026-10-12 20:28:01</span></pre>
<p>Ye FortiGate connected hai aur shayad kahin aur managed bhi, par FAZ-1 ke liye anjaan hai. Uske logs discard hote hain.</p>

<h3>Security Fabric (theory)</h3>
<p><b>Security Fabric</b> Fortinet ka idea hai ki FortiGates aur doosre products jude hon taaki information share karein. Fabric mein root FortiGate baakiyon ko lead karta hai aur FortiAnalyzer sab ke logs receive karta hai, jisse topology views aur combined picture milti hai. Real product mein fabric devices ke liye special ADOM type aur FortiView jaise dashboards hain. Simulator mein inme se kuch nahi: Security Fabric ADOM nahi, FortiView nahi, topology view nahi. Teen sentences yaad rakho: fabric information share karta hai; FortiAnalyzer logging aur reporting member hai; FortiManager configuration member hai.</p>

<h3>Co-location aur playbooks (theory)</h3>
<p>Kuch FortiManager versions mein FortiAnalyzer features usi box mein ho sakte hain, aur FortiAnalyzer automated responses start kar sakta hai aur incidents ko SOAR tool (FortiSOAR) ko de sakta hai. Simulator inme se kuch model nahi karta; events module ka incident workflow sirf basic roop hai.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Salem ka FortiGate add karta hai. Do columns ki checklist. FortiManager column: central-management set, ADOM Kaveri mein authorized, policy package installed. FortiAnalyzer column: logging 192.0.2.6 par serial ke saath, ADOM mein registered, test log mila. Project tab done hai jab dono columns mein tick ho. Aam failure wo site hai jahan sirf left column tick hai: managed, patched, aur har report mein invisible.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Maan lena ki FortiManager authorization se logs FortiAnalyzer ko jaate hain. FAZ-1 par aisa device dhoondhna jo sirf FortiManager mein hai. Dono mein same ADOM name use karke samajhna ki wo ek hi object hai. Customer ko "fabric topology" ka vaada karna jabki lab sirf logs, events, incidents aur reports dikha sakta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> FGFM TCP 541 hai aur FortiManager ka hai; log path OFTP 514 par hai aur FortiAnalyzer ka hai. FortiManager mein authorize karne se FortiAnalyzer mein register nahi hota. Security Fabric ADOM aur FortiView is course mein theory hain.</p></div>

<div class="scn"><h4>Managed par invisible</h4><p>Ek naya branch FortiGate FortiManager mein authorize hua tha aur policy package mil chuka tha. Do hafte baad security manager ne uska denied traffic maanga aur FAZ-1 par kuch nahi tha. Device ko kabhi FortiAnalyzer par point hi nahi kiya gaya tha, isliye connection bhi nahi thi aur entry bhi nahi. Logging setting aur registration ke baad pehle logs aaye. Branch traffic ke do hafte wapas nahi aaye.</p><p><b>Lesson:</b> har onboarding checklist mein "managed" aur "logging" ko do alag lines banao.</p></div>

<div class="iv"><p class="q">"FortiGate, FortiManager aur FortiAnalyzer saath mein kaise kaam karte hain?"</p><p>FortiGate policy enforce karta hai aur logs likhta hai. FortiManager intended configuration rakhta hai aur FGFM par TCP 541 se push karta hai. FortiAnalyzer OFTP par 514 se logs receive karta hai aur search, events aur reports deta hai. Ye independent hain: device ko har ek mein add karna padta hai. Security Fabric ko information sharing ke umbrella ki tarah mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiManager configuration manage karta hai (FGFM, TCP 541); FortiAnalyzer logs collect karta hai (OFTP, port 514).</li>
<li>FortiManager mein authorize karne se FortiAnalyzer mein register nahi hota, aur ulta bhi sach hai.</li>
<li>Har naye site ko har system ki onboarding checklist mein ek line chahiye.</li>
<li>Security Fabric topology, fabric ADOM, FortiView aur co-location yahan theory hain.</li>
<li>FortiManager side ke liye is course ka FortiManager track use karo.</li>
</ul></div>
`}};export{e as default};