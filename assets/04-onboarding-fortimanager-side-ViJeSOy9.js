var e={id:`onboarding-fortimanager-side`,h:{en:`Onboarding from the FortiManager side`,hi:`FortiManager side se onboarding`},body:{en:`
<p>In the last chapter the new employee walked to reception. There is a second way to join: the manager phones the employee and says "come and sit at desk 12". Adding a device from the FortiManager side is that phone call. It saves the visit to the FortiGate CLI, but the FortiGate must be willing to pick up the phone.</p>

<h3>Step 1: what the FortiManager does</h3>
<p>In the real product you use the Add Device wizard in the Device Manager and give it the FortiGate's IP address, a login and the ADOM. FortiManager then connects to the FortiGate on TCP 541, reads its serial number and firmware, retrieves the configuration and creates the device entry. In one move the device is authorized, so there is no unauthorized list in this method. The simulator condenses the wizard into one command: <code>execute fmgui add-device &lt;name&gt; &lt;ip&gt; &lt;adom&gt;</code>. As before, this is a simulator form of a GUI or API action.</p>

<h3>Step 2: what the FortiGate must allow</h3>
<p>Every FortiGate interface has an <code>allowaccess</code> list, the management services that may reach it. Typical words are ping, ssh, snmp and, for this method, <b>fgfm</b>. If the interface that faces FortiManager does not list fgfm, the FortiGate refuses the connection on port 541, and the add fails. This is a different problem from chapter 3: there the FortiGate was the caller, so no inbound permission was needed.</p>
<pre class="out">HQ-FGT # show system interface port1
config system interface
    edit "port1"
        set ip 192.0.2.11 255.255.255.0
        set allowaccess ping <span class="hl">fgfm</span>
        set alias "WAN"
    next
end

MDU-FGT # show system interface port1
        set ip 192.0.2.12 255.255.255.0
        set allowaccess <span class="hl">ping</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two directions of FGFM">
<rect x="20" y="20" width="160" height="60" rx="8" fill="#ddd6fe"/><text x="100" y="46" text-anchor="middle" class="svg-ink" font-size="13">FMG-1</text><text x="100" y="64" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.5</text>
<rect x="460" y="20" width="160" height="60" rx="8" fill="#bae6fd"/><text x="540" y="46" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="540" y="64" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.12</text>
<line x1="180" y1="40" x2="460" y2="40" stroke="#64748b" stroke-width="2"/><text x="320" y="34" text-anchor="middle" class="svg-accent" font-size="12">FortiManager calls: needs allowaccess fgfm</text>
<line x1="460" y1="62" x2="180" y2="62" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">FortiGate calls: needs central-management</text>
<rect x="150" y="115" width="340" height="48" rx="8" fill="#fde68a"/><text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="13">Same tunnel afterwards: TCP 541</text>
</svg><p class="cap">Solid line: FortiManager starts. Dashed line: the FortiGate starts.</p></div>

<h3>Step 3: read the refusal</h3>
<p>The simulator's refusal message tells you the cause in plain words. Read the exact text before changing anything.</p>
<pre class="out">FMG-1 # execute fmgui add-device MDU-FGT 192.0.2.12 Kaveri
<span class="hl">Add device failed: 192.0.2.12 refused the connection on TCP/541. Allow FortiManager access (allowaccess fgfm) on the FortiGate interface.</span></pre>
<p>Compare the two phrases "refused" and "timed out". Refused means the FortiGate answered and said no, so the path works and the fix is a permission on the FortiGate. Timed out means no answer at all, so look at the address and the route.</p>
<pre class="out">FMG-1 # execute fmgui add-device MDU-FGT 192.0.2.99 Kaveri
Add device failed: no response from 192.0.2.99 (connection to TCP/541 timed out).</pre>

<h3>Step 4: fix and verify</h3>
<p>On the FortiGate, add fgfm to the allowaccess list of port1. Keep the services that were there; in the CLI the <code>set allowaccess</code> line replaces the whole list, so write ping fgfm, not only fgfm.</p>
<pre class="code"><span class="c">! on MDU-FGT</span>
config system interface
    edit port1
        set allowaccess ping fgfm
    next
end</pre>
<pre class="out">FMG-1 # execute fmgui add-device MDU-FGT 192.0.2.12 Kaveri
<span class="hl">Device MDU-FGT added to ADOM Kaveri (FortiManager connected to 192.0.2.12:541, central-management configured on the device).</span>
Configuration retrieved: revision 1.</pre>
<p>Notice the last words of the first line: FortiManager has configured central-management on the device itself. If you now run <code>show system central-management</code> on MDU-FGT, you will see type fortimanager and fmg 192.0.2.5, exactly what you typed by hand in chapter 3.</p>

<div class="eg"><p><b>Worked example.</b> The Madurai FortiGate port1 has the address 192.0.2.12 and allows only ping. The network engineer runs add-device from FMG-1 and reads "refused the connection on TCP/541". She adds fgfm to the allowaccess list, runs add-device again and sees revision 1. The whole fix took one CLI change and no network change.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>set allowaccess fgfm</code> and removing ping or ssh by accident; enabling fgfm on the wrong interface; mixing up refused and timed out; and adding the device when the ADOM does not exist or has another version. Real firewalls also need a local policy or a trusted-host rule if administrators are restricted by source address. The simulator does not model those extra checks.</p></div>

<div class="exam"><p><b>Exam traps.</b> allowaccess fgfm is needed when FortiManager initiates the connection. After the add, central-management is configured on the device automatically. Both ways use TCP 541. Adding a device does not import its policy; that is still a separate step.</p></div>

<div class="scn"><h4>Fifteen branches, one forgotten keyword</h4><p>A contractor added 15 FortiGates from the FortiManager in one afternoon. Fourteen worked. The fifteenth was refused on TCP 541. The contractor spent time on the firewall policy, but the interface facing the management network simply did not list fgfm. One CLI line fixed it.</p><p><b>Lesson:</b> a refusal means the device answered; check its allowaccess before the network.</p></div>

<div class="iv"><p class="q">"What does a FortiGate need to allow so that FortiManager can add it?"</p><p>The management interface must have fgfm in allowaccess, so that TCP 541 is accepted. Mention that FortiManager then sets central-management on the device, and that the keyword is not needed in the other direction where the FortiGate calls in.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>add-device lets FortiManager start the FGFM connection.</li>
<li>The FortiGate interface needs fgfm in allowaccess.</li>
<li>A refusal means the device answered; a timeout means there was no answer.</li>
<li>After a successful add, central-management is set on the device and revision 1 exists.</li>
<li>set allowaccess replaces the whole list, so keep the old services.</li>
</ul></div>
`,hi:`
<p>Pichhle chapter mein naya employee reception tak chalkar gaya tha. Join karne ka doosra tarika bhi hai: manager employee ko phone karke kehta hai "aao, desk 12 par baitho". FortiManager side se device add karna wahi phone call hai. Isse FortiGate CLI tak jaana bach jata hai, par FortiGate ko phone uthane ke liye taiyar hona chahiye.</p>

<h3>Step 1: FortiManager kya karta hai</h3>
<p>Real product mein Device Manager ke Add Device wizard mein FortiGate ka IP address, login aur ADOM dete ho. Phir FortiManager FortiGate se TCP 541 par connect karta hai, uska serial number aur firmware padhta hai, configuration retrieve karta hai aur device entry banata hai. Ek hi move mein device authorized ho jata hai, isliye is method mein unauthorized list nahi hoti. Simulator wizard ko ek command mein samet deta hai: <code>execute fmgui add-device &lt;name&gt; &lt;ip&gt; &lt;adom&gt;</code>. Pehle ki tarah, ye GUI ya API action ka simulator form hai.</p>

<h3>Step 2: FortiGate ko kya allow karna hai</h3>
<p>Har FortiGate interface ki ek <code>allowaccess</code> list hoti hai, un management services ki jo us tak pahunch sakti hain. Aam words hain ping, ssh, snmp aur is method ke liye <b>fgfm</b>. FortiManager ki taraf wale interface par fgfm list mein na ho to FortiGate port 541 par connection refuse karta hai, aur add fail ho jata hai. Ye chapter 3 se alag problem hai: wahan FortiGate caller tha, to inbound permission ki zaroorat nahi thi.</p>
<pre class="out">HQ-FGT # show system interface port1
config system interface
    edit "port1"
        set ip 192.0.2.11 255.255.255.0
        set allowaccess ping <span class="hl">fgfm</span>
        set alias "WAN"
    next
end

MDU-FGT # show system interface port1
        set ip 192.0.2.12 255.255.255.0
        set allowaccess <span class="hl">ping</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="FGFM ki do directions">
<rect x="20" y="20" width="160" height="60" rx="8" fill="#ddd6fe"/><text x="100" y="46" text-anchor="middle" class="svg-ink" font-size="13">FMG-1</text><text x="100" y="64" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.5</text>
<rect x="460" y="20" width="160" height="60" rx="8" fill="#bae6fd"/><text x="540" y="46" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="540" y="64" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.12</text>
<line x1="180" y1="40" x2="460" y2="40" stroke="#64748b" stroke-width="2"/><text x="320" y="34" text-anchor="middle" class="svg-accent" font-size="12">FortiManager call kare: allowaccess fgfm chahiye</text>
<line x1="460" y1="62" x2="180" y2="62" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">FortiGate call kare: central-management chahiye</text>
<rect x="150" y="115" width="340" height="48" rx="8" fill="#fde68a"/><text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="13">Baad mein wahi tunnel: TCP 541</text>
</svg><p class="cap">Solid line: FortiManager start karta hai. Dashed line: FortiGate start karta hai.</p></div>

<h3>Step 3: refusal padho</h3>
<p>Simulator ka refusal message cause saaf shabdon mein batata hai. Kuch badalne se pehle exact text padho.</p>
<pre class="out">FMG-1 # execute fmgui add-device MDU-FGT 192.0.2.12 Kaveri
<span class="hl">Add device failed: 192.0.2.12 refused the connection on TCP/541. Allow FortiManager access (allowaccess fgfm) on the FortiGate interface.</span></pre>
<p>"Refused" aur "timed out" ki tulna karo. Refused ka matlab FortiGate ne jawab diya aur mana kiya, yaani path chal raha hai aur fix FortiGate par permission hai. Timed out ka matlab koi jawab nahi, to address aur route dekho.</p>
<pre class="out">FMG-1 # execute fmgui add-device MDU-FGT 192.0.2.99 Kaveri
Add device failed: no response from 192.0.2.99 (connection to TCP/541 timed out).</pre>

<h3>Step 4: fix karo aur verify karo</h3>
<p>FortiGate par port1 ki allowaccess list mein fgfm jodo. Jo services pehle thi unhe rakho; CLI mein <code>set allowaccess</code> line poori list replace karti hai, isliye ping fgfm likho, sirf fgfm nahi.</p>
<pre class="code"><span class="c">! on MDU-FGT</span>
config system interface
    edit port1
        set allowaccess ping fgfm
    next
end</pre>
<pre class="out">FMG-1 # execute fmgui add-device MDU-FGT 192.0.2.12 Kaveri
<span class="hl">Device MDU-FGT added to ADOM Kaveri (FortiManager connected to 192.0.2.12:541, central-management configured on the device).</span>
Configuration retrieved: revision 1.</pre>
<p>Pehli line ke aakhri words dekho: FortiManager ne device par khud central-management configure kar diya. Ab MDU-FGT par <code>show system central-management</code> chalao to type fortimanager aur fmg 192.0.2.5 dikhega, bilkul wahi jo chapter 3 mein haath se type kiya tha.</p>

<div class="eg"><p><b>Worked example.</b> Madurai FortiGate ka port1 address 192.0.2.12 hai aur sirf ping allow karta hai. Network engineer FMG-1 se add-device chalati hai aur "refused the connection on TCP/541" padhti hai. Wo allowaccess list mein fgfm jodti hai, add-device phir chalati hai aur revision 1 dekhti hai. Poora fix ek CLI change tha, network change nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>set allowaccess fgfm</code> type karke ghalti se ping ya ssh hata dena; galat interface par fgfm enable karna; refused aur timed out mix karna; aur ADOM ke exist na karne par ya alag version hone par device add karna. Real firewalls ko local policy ya trusted-host rule bhi chahiye ho sakta hai agar administrators source address se restricted hon. Simulator ye extra checks model nahi karta.</p></div>

<div class="exam"><p><b>Exam traps.</b> FortiManager connection start kare tab allowaccess fgfm chahiye. Add ke baad central-management device par automatically configure ho jata hai. Dono tareeke TCP 541 use karte hain. Device add karne se uski policy import nahi hoti; wo alag step hai.</p></div>

<div class="scn"><h4>Pandrah branches, ek bhoola hua keyword</h4><p>Ek contractor ne ek dopahar mein FortiManager se 15 FortiGates add kiye. Chaudah chale. Pandrahwa TCP 541 par refuse hua. Contractor ne firewall policy mein time lagaya, par management network wale interface par fgfm list mein tha hi nahi. Ek CLI line ne fix kar diya.</p><p><b>Lesson:</b> refusal ka matlab device ne jawab diya; network se pehle uski allowaccess check karo.</p></div>

<div class="iv"><p class="q">"FortiManager ke add karne ke liye FortiGate ko kya allow karna padta hai?"</p><p>Management interface ki allowaccess mein fgfm hona chahiye, taaki TCP 541 accept ho. Ye bhi batao ki FortiManager phir device par central-management set karta hai, aur ki ulte direction mein jahan FortiGate call karta hai wahan ye keyword zaroori nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>add-device FortiManager ko FGFM connection start karne deta hai.</li>
<li>FortiGate interface ki allowaccess mein fgfm chahiye.</li>
<li>Refusal ka matlab device ne jawab diya; timeout ka matlab jawab nahi aaya.</li>
<li>Successful add ke baad device par central-management set hota hai aur revision 1 banta hai.</li>
<li>set allowaccess poori list replace karta hai, isliye purani services rakho.</li>
</ul></div>
`}};export{e as default};