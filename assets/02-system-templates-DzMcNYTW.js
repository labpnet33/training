var e={id:`system-templates`,h:{en:`System templates (DNS), assignment and dev-db modified`,hi:`System templates (DNS), assignment aur dev-db modified`},body:{en:`
<p>A restaurant chain prints one menu and sends the same file to every outlet. Printing the menu is not the same as the menu being on the tables. In FortiManager the same two steps exist for a system template: you <b>define and assign</b> it, which only changes FortiManager's own database, and later you <b>install</b> it, which changes the FortiGate. The status field <code>dev-db</code> tells you which of the two steps has happened.</p>

<h3>What a system template is</h3>
<p>A <b>system template</b> holds basic system settings of a FortiGate. In the real product this covers many items; in the simulator it covers exactly three: the primary DNS server, the secondary DNS server and the DNS search domain. It lives in the table <code>config pm template</code> with <code>set kind system</code>. Every ADOM also has a Fortinet-managed template called <b>default</b>. It is read-only: you cannot edit it, you can only choose another template instead of it.</p>

<h3>Step by step</h3>
<ol>
<li><b>Create</b> the template in the ADOM: name, ADOM, kind, and the DNS values.</li>
<li><b>Assign</b> it to a device: in <code>config dvmdb device</code> set the attribute <code>template</code> on the device entry. The template must exist, otherwise FortiManager answers that it does not exist.</li>
<li><b>Read the status</b>: <code>diagnose dvm device list</code> now shows <code>dev-db: modified</code> and <code>cond: pending</code>. FortiManager has changes the device does not have.</li>
<li><b>Preview</b>: <code>execute fmgui install-preview Kaveri TRY-FGT</code> lists the CLI lines that would be sent. Nothing is sent to the device.</li>
<li><b>Install</b>: <code>execute fmgui install-device Kaveri TRY-FGT</code> sends the device settings only, with no policy package. A new revision is created and dev-db returns to not modified.</li>
</ol>
<p>Remember that preview, install-device and the other fmgui commands are simulator forms of GUI or API actions in the real product.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Life cycle of dev-db status">
<rect x="20" y="40" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="95" y="66" text-anchor="middle" class="svg-ink" font-size="13">not modified</text><text x="95" y="86" text-anchor="middle" class="svg-muted" font-size="12">after retrieve</text>
<rect x="245" y="40" width="150" height="60" rx="8" fill="#fde68a"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="13">modified</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">template assigned</text>
<rect x="470" y="40" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="66" text-anchor="middle" class="svg-ink" font-size="13">not modified</text><text x="545" y="86" text-anchor="middle" class="svg-muted" font-size="12">after install-device</text>
<line x1="170" y1="70" x2="245" y2="70" stroke="#64748b" stroke-width="2"/><line x1="395" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="175" y="60" class="svg-accent" font-size="12">assign</text><text x="405" y="60" class="svg-accent" font-size="12">install</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">editing an assigned template also sets modified again</text>
</svg><p class="cap">dev-db is a pending-changes flag, not a health flag.</p></div>

<div class="eg"><p><b>Worked example.</b> Kaveri creates KR-DNS with primary 192.0.2.53, secondary 192.0.2.54 and domain kaveri.example, and assigns it to TRY-FGT. The branch shows an empty DNS configuration at that moment, because nothing was installed.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! on FMG-1: create the template, then assign it</span>
config pm template
    edit "KR-DNS"
        set adom "Kaveri"
        set kind system
        set dns-primary 192.0.2.53
        set dns-secondary 192.0.2.54
        set dns-domain "kaveri.example"
    next
end
config dvmdb device
    edit "TRY-FGT"
        set template "KR-DNS"
    next
end</pre>

<h3>What the output looks like</h3>
<p>Right after the assignment, FMG-1 reports a pending change. The FortiGate itself is still empty:</p>
<pre class="out">FMG-1 # diagnose dvm device list TRY-FGT
fmgfaz-managed  578  FGVMEV3X688U0000  -  192.0.2.13  TRY-FGT  Kaveri  -  7.6 MR0 (3401)
        |- STATUS: <span class="hl">dev-db: modified</span>; conf: in sync; cond: pending; dm: retrieved; conn: up; source: FMG

TRY-FGT # show system dns
config system dns
end</pre>
<p>After <code>install-device</code> the revision history has a second entry and the FortiGate has the values. Revision diff shows exactly what arrived:</p>
<pre class="out">FMG-1 # execute fmgui revision diff TRY-FGT 1 2
Difference between revision 1 (Retrieved) and revision 2 (Installed device settings):
+ config system dns
+     set primary 192.0.2.53
+     set secondary 192.0.2.54
+     set domain "kaveri.example"
+ end</pre>

<p>Notice that <code>conf</code> stays <code>in sync</code> the whole time. Conf compares the FortiGate with FortiManager's last copy of it. A pending template changes neither side, so conf says nothing about it. Only dev-db does.</p>

<div class="warn"><p><b>Common mistakes.</b> Typing an unknown template name in <code>set template</code>: the simulator answers "System template 'NOPE' does not exist" and the command fails, but the CLI stays inside the edit, so the next <code>execute</code> line is rejected with a parse error until you type <code>end</code>. Expecting the default template to be editable. Reading dev-db modified as a fault: it is only a waiting change. Installing and not checking the device afterwards.</p></div>

<div class="exam"><p><b>Exam traps.</b> dev-db is about pending device-database changes (templates), conf is about the device differing from FortiManager's copy, and pkg is about the policy package. An edit of an already assigned template sets dev-db to modified again. The default template and the Fortinet-recommended templates are read-only. In the real product a system template can set much more than DNS; here it covers DNS only.</p></div>

<div class="scn"><h4>Everything looked fine, but the branch could not resolve names</h4><p>An engineer assigned a DNS template to a new branch on Friday and the device list showed green connection status, so he went home. On Monday users in the branch still could not resolve the intranet name. Reading the status again showed dev-db: modified and cond: pending: the settings were assigned but never installed. A preview listed the five DNS lines, one install-device sent them, and the status went back to not modified.</p><p><b>Lesson:</b> a connected device with a pending dev-db has received nothing. Always finish with an install and a check on the FortiGate.</p></div>

<div class="iv"><p class="q">"You assigned a template to a device. Is the device configured now?"</p><p>No. Assignment changes only the device database in FortiManager, which shows as dev-db: modified. The FortiGate changes when the device settings are installed. A strong answer adds that you can preview the exact CLI lines first, that install creates a revision, and that you verify with a show command on the FortiGate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A system template holds DNS primary, secondary and domain in the simulator; default is read-only.</li>
<li>Assign with set template in the device entry; this only changes the device database.</li>
<li>dev-db: modified plus cond: pending means settings are waiting for an install.</li>
<li>install-preview shows the CLI lines; install-device sends device settings and creates a revision.</li>
<li>conf can stay in sync while dev-db is modified; they measure different things.</li>
</ul></div>
`,hi:`
<p>Ek restaurant chain ek menu print karti hai aur wahi file har outlet ko bhejti hai. Menu print hona aur menu tables par hona ek cheez nahi hai. FortiManager mein system template ke liye bhi wahi do steps hain: aap use <b>define aur assign</b> karte ho, jo sirf FortiManager ka apna database badalta hai, aur baad mein <b>install</b> karte ho, jo FortiGate badalta hai. Status field <code>dev-db</code> batata hai ki do mein se kaunsa step ho chuka hai.</p>

<h3>System template kya hai</h3>
<p><b>System template</b> FortiGate ki basic system settings rakhta hai. Real product mein isme kai items aate hain; simulator mein bilkul teen: primary DNS server, secondary DNS server aur DNS search domain. Ye <code>config pm template</code> table mein <code>set kind system</code> ke saath rehta hai. Har ADOM mein Fortinet-managed template <b>default</b> bhi hota hai. Ye read-only hai: aap ise edit nahi kar sakte, bas iski jagah doosra template chun sakte ho.</p>

<h3>Step by step</h3>
<ol>
<li>ADOM mein template <b>create</b> karo: name, ADOM, kind aur DNS values.</li>
<li>Device ko <b>assign</b> karo: <code>config dvmdb device</code> mein device entry par attribute <code>template</code> set karo. Template exist karna chahiye, warna FortiManager kehta hai ki wo exist nahi karta.</li>
<li><b>Status padho</b>: <code>diagnose dvm device list</code> ab <code>dev-db: modified</code> aur <code>cond: pending</code> dikhata hai. FortiManager ke paas wo changes hain jo device ke paas nahi.</li>
<li><b>Preview</b>: <code>execute fmgui install-preview Kaveri TRY-FGT</code> wo CLI lines dikhata hai jo bheji jayengi. Device ko kuch nahi bheja jata.</li>
<li><b>Install</b>: <code>execute fmgui install-device Kaveri TRY-FGT</code> sirf device settings bhejta hai, policy package nahi. Naya revision banta hai aur dev-db wapas not modified ho jata hai.</li>
</ol>
<p>Yaad rakho ki preview, install-device aur baaki fmgui commands real product ke GUI ya API actions ke simulator forms hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="dev-db status ka life cycle">
<rect x="20" y="40" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="95" y="66" text-anchor="middle" class="svg-ink" font-size="13">not modified</text><text x="95" y="86" text-anchor="middle" class="svg-muted" font-size="12">retrieve ke baad</text>
<rect x="245" y="40" width="150" height="60" rx="8" fill="#fde68a"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="13">modified</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">template assign hua</text>
<rect x="470" y="40" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="66" text-anchor="middle" class="svg-ink" font-size="13">not modified</text><text x="545" y="86" text-anchor="middle" class="svg-muted" font-size="12">install-device ke baad</text>
<line x1="170" y1="70" x2="245" y2="70" stroke="#64748b" stroke-width="2"/><line x1="395" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="175" y="60" class="svg-accent" font-size="12">assign</text><text x="405" y="60" class="svg-accent" font-size="12">install</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">assigned template edit karne par bhi modified ho jata hai</text>
</svg><p class="cap">dev-db pending-changes flag hai, health flag nahi.</p></div>

<div class="eg"><p><b>Worked example.</b> Kaveri KR-DNS banata hai: primary 192.0.2.53, secondary 192.0.2.54, domain kaveri.example, aur use TRY-FGT ko assign karta hai. Us waqt branch ki DNS configuration khaali dikhti hai, kyunki kuch install nahi hua.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! on FMG-1: create the template, then assign it</span>
config pm template
    edit "KR-DNS"
        set adom "Kaveri"
        set kind system
        set dns-primary 192.0.2.53
        set dns-secondary 192.0.2.54
        set dns-domain "kaveri.example"
    next
end
config dvmdb device
    edit "TRY-FGT"
        set template "KR-DNS"
    next
end</pre>

<h3>Output kaisa dikhta hai</h3>
<p>Assignment ke turant baad FMG-1 pending change report karta hai. FortiGate abhi bhi khaali hai:</p>
<pre class="out">FMG-1 # diagnose dvm device list TRY-FGT
fmgfaz-managed  578  FGVMEV3X688U0000  -  192.0.2.13  TRY-FGT  Kaveri  -  7.6 MR0 (3401)
        |- STATUS: <span class="hl">dev-db: modified</span>; conf: in sync; cond: pending; dm: retrieved; conn: up; source: FMG

TRY-FGT # show system dns
config system dns
end</pre>
<p><code>install-device</code> ke baad revision history mein doosri entry hoti hai aur FortiGate ke paas values hoti hain. Revision diff bilkul dikhata hai kya pahuncha:</p>
<pre class="out">FMG-1 # execute fmgui revision diff TRY-FGT 1 2
Difference between revision 1 (Retrieved) and revision 2 (Installed device settings):
+ config system dns
+     set primary 192.0.2.53
+     set secondary 192.0.2.54
+     set domain "kaveri.example"
+ end</pre>

<p>Dhyan do ki <code>conf</code> poore time <code>in sync</code> rehta hai. Conf FortiGate ko FortiManager ki last copy se compare karta hai. Pending template dono mein se kisi side ko nahi badalta, isliye conf ispar kuch nahi kehta. Sirf dev-db batata hai.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>set template</code> mein unknown template name type karna: simulator "System template 'NOPE' does not exist" kehta hai aur command fail hota hai, lekin CLI edit ke andar hi rehta hai, isliye agli <code>execute</code> line parse error se reject hoti hai jab tak aap <code>end</code> type na karo. Default template ko editable samajhna. Dev-db modified ko fault padhna: ye sirf waiting change hai. Install karke FortiGate par check na karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> dev-db pending device-database changes (templates) ke baare mein hai, conf device ke FortiManager ki copy se alag hone ke baare mein, aur pkg policy package ke baare mein. Pehle se assigned template edit karne par dev-db phir modified ho jata hai. Default template aur Fortinet-recommended templates read-only hain. Real product mein system template DNS se bahut zyada set kar sakta hai; yahan sirf DNS hai.</p></div>

<div class="scn"><h4>Sab theek dikha, par branch names resolve nahi kar paayi</h4><p>Ek engineer ne Friday ko nayi branch ko DNS template assign kiya aur device list mein connection status green tha, to wo ghar chala gaya. Monday ko branch ke users abhi bhi intranet name resolve nahi kar paa rahe the. Status dubara padha to dev-db: modified aur cond: pending dikha: settings assign hui thi par install kabhi nahi hui. Preview ne paanch DNS lines dikhayi, ek install-device ne unhe bheja, aur status wapas not modified ho gaya.</p><p><b>Lesson:</b> connected device jiska dev-db pending hai, usne kuch receive nahi kiya. Hamesha install aur FortiGate par check se khatam karo.</p></div>

<div class="iv"><p class="q">"Aapne device ko template assign kiya. Kya device ab configured hai?"</p><p>Nahi. Assignment sirf FortiManager ka device database badalti hai, jo dev-db: modified ki tarah dikhta hai. FortiGate tab badalta hai jab device settings install hoti hain. Strong answer mein ye bhi: pehle exact CLI lines preview kar sakte ho, install revision banata hai, aur FortiGate par show command se verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Simulator mein system template DNS primary, secondary aur domain rakhta hai; default read-only hai.</li>
<li>Device entry mein set template se assign karo; ye sirf device database badalta hai.</li>
<li>dev-db: modified aur cond: pending ka matlab settings install ka wait kar rahi hain.</li>
<li>install-preview CLI lines dikhata hai; install-device device settings bhejta hai aur revision banata hai.</li>
<li>dev-db modified ho tab bhi conf in sync reh sakta hai; dono alag cheezein naapte hain.</li>
</ul></div>
`}};export{e as default};