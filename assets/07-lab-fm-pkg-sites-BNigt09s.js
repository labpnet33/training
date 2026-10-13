var e={id:`lab-fm-pkg-sites`,h:{en:`Lab fm-pkg-sites: one policy package for three sites`,hi:`Lab fm-pkg-sites: teen sites ke liye ek policy package`},body:{en:`
<p>Welcome to the lab <b>fm-pkg-sites</b> (config lab, about 35 minutes). In the previous lab you served two branches. Now you serve all three Kaveri sites, head office included, with <b>one</b> package. This is the payoff of chapters 1 to 3: one address object, one pair of normalized interfaces, one package.</p>

<div class="note"><p><b>Situation.</b> HQ-FGT (Chennai), MDU-FGT (Madurai) and TRY-FGT (Trichy) are all authorized in the ADOM Kaveri and have no firewall policy. At the start of the lab the device list shows <code>pkg:[unknown]null</code> for all three. The goal: every site PC reaches the intranet web server SRV-WEB (192.0.2.80). The <code>execute fmgui</code> commands are simulator commands for GUI actions of the real product.</p></div>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="One package All-Sites installed on three FortiGates">
<rect x="230" y="10" width="180" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Package All-Sites</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">policy 1 LAN-TO-SRV</text>
<rect x="30" y="130" width="150" height="56" rx="8" fill="#bae6fd"/><text x="105" y="154" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="105" y="172" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.10.0.0/24</text>
<rect x="245" y="130" width="150" height="56" rx="8" fill="#bae6fd"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.20.0.0/24</text>
<rect x="460" y="130" width="150" height="56" rx="8" fill="#bae6fd"/><text x="535" y="154" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="535" y="172" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.30.0.0/24</text>
<line x1="270" y1="66" x2="105" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="66" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><line x1="370" y1="66" x2="535" y2="130" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Same package, three installs (one per device). NAT lets each LAN reach SRV-WEB.</p></div>

<h3>Task 1: objects with three mappings each</h3>
<p><b>Goal:</b> the address SRV-WEB (192.0.2.80/32) and normalized interfaces LAN and WAN, mapped for all three FortiGates (LAN is port2, WAN is port1).</p>
<p><b>Approach:</b> the same tables as in fm-install, but with <b>three</b> rows in each <code>dynamic-mapping</code> block. Count them: two normalized interfaces times three devices is six rows. <b>Check:</b> <code>show pm interface</code> lists HQ-FGT, MDU-FGT and TRY-FGT under both LAN and WAN. <b>Wrong turn:</b> forgetting HQ-FGT because the earlier lab only had branches. A missing HQ-FGT row is exactly the kind of mistake that appears only when you install to head office.</p>

<h3>Task 2: the package with three installation targets</h3>
<p><b>Goal:</b> package All-Sites, installation targets HQ-FGT, MDU-FGT and TRY-FGT, policy 1: LAN to WAN, destination SRV-WEB, accept with NAT.</p>
<p><b>Approach:</b> one <code>set install-target</code> line with three quoted names. <b>Check:</b> <code>show pm pkg</code>. The output shows the three names; if one is missing you will meet the message "is not an installation target" later. Think about naming: the package is shared by all sites, so All-Sites is a better name than Branch-PP (chapter 5).</p>

<h3>Task 3: preview one, install three</h3>
<p><b>Goal:</b> preview for HQ-FGT, then install All-Sites on each FortiGate, and test from each PC.</p>
<p><b>Approach:</b> <code>install-preview Kaveri All-Sites HQ-FGT</code> first. The FortiGates have no policies, so you see address lines and policy lines. Then run <code>install-package</code> three times, once per device; an install is always per device. Read the success line each time, including the revision number.</p>
<p><b>Verify</b> on FMG-1 with <code>diagnose dvm device list</code>: all three show the same package.</p>
<pre class="out">FMG-1 # diagnose dvm device list
... HQ-FGT  ... |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: installed; conn: up
                |- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[installed]All-Sites</span>
... MDU-FGT ... |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: installed; conn: up
                |- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[installed]All-Sites</span>
... TRY-FGT ... |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: installed; conn: up
                |- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[installed]All-Sites</span></pre>
<p>Then <code>ping 192.0.2.80</code> from PC-HQ, PC-MDU and PC-TRY. All three must answer. On any FortiGate, <code>show firewall policy</code> should list policy 1 LAN-TO-SRV with srcintf port2 and dstintf port1: the normalized names are gone and the real ports are there.</p>

<h3>Task 4: the one-word question</h3>
<p>The last task asks what an install does to the firewall policy table of the target: it adds to it or replaces it. You know the answer from chapter 4. The simulator lets you see it: run the preview for HQ-FGT again after the install. Because the device now has policy 1, the first lines of the preview are a <code>delete 1</code> inside <code>config firewall policy</code>, followed by the same policy being created again. That delete line is the replace in action.</p>
<pre class="out">FMG-1 # execute fmgui install-preview Kaveri All-Sites HQ-FGT
Install preview for HQ-FGT (21 CLI lines, nothing is sent to the device):
  config firewall policy
  <span class="hl">delete 1</span>
  end
  config firewall address
  edit "SRV-WEB"
  ...</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Installing to only one device and then testing the other two PCs. (2) Reading the lab as "the package installs itself on all targets": install-target is a permission list, not an automatic push. (3) Typing the install command with the arguments in the wrong order (adom, package, device). (4) Skipping the HQ-FGT mapping rows because head office looks different from the branches.</p></div>

<div class="exam"><p><b>Exam traps.</b> Installation targets say where the package may go; install itself is run per device. Replace, not add: the same package installed twice does not duplicate policies. One package for several devices only works when every device has mapping rows for every normalized interface that the package uses.</p></div>

<div class="scn"><h4>Four new shops in a week</h4><p>A retailer with the All-Sites design opened four small shops in one week. For each shop the engineer authorized the FortiGate, added two mapping rows (LAN and WAN) and added the device name to install-target. Four previews, four installs, four pings. The same work done with individual rules would have meant four fresh configurations and four chances for a typo.</p><p><b>Lesson:</b> with a shared package, a new site costs a few mapping rows, not a new configuration.</p></div>

<div class="iv"><p class="q">"How would you roll out one rule to ten branches safely?"</p><p>Add the rule once to the shared package, check that all ten devices are installation targets with mapping rows, preview one representative device and look for unexpected delete lines, install it first to a pilot branch, test, and then install the remaining nine, checking the device list for installed and in sync.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One address object and two normalized interfaces serve all sites; each site needs its own mapping rows.</li>
<li>A shared package lists every site in install-target, but each install runs per device.</li>
<li>After success, diagnose dvm device list shows the same pkg:[installed] name on every device.</li>
<li>The preview of an already-installed device begins with delete lines: install replaces the table.</li>
<li>Test from every site PC, not only from one.</li>
</ul></div>
`,hi:`
<p>Lab <b>fm-pkg-sites</b> (config lab, lagbhag 35 minute) mein swagat hai. Pichhle lab mein aapne do branches serve ki thi. Ab aap Kaveri ki teeno sites, head office samet, <b>ek</b> package se serve karte ho. Yahi chapters 1 se 3 ka phal hai: ek address object, normalized interfaces ki ek jodi, ek package.</p>

<div class="note"><p><b>Situation.</b> HQ-FGT (Chennai), MDU-FGT (Madurai) aur TRY-FGT (Trichy) teeno ADOM Kaveri mein authorized hain aur kisi par firewall policy nahi hai. Lab ki shuruaat mein device list teeno ke liye <code>pkg:[unknown]null</code> dikhati hai. Goal: har site ka PC intranet web server SRV-WEB (192.0.2.80) tak pahunche. <code>execute fmgui</code> commands real product ke GUI actions ke liye simulator commands hain.</p></div>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Ek package All-Sites teen FortiGates par installed">
<rect x="230" y="10" width="180" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Package All-Sites</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">policy 1 LAN-TO-SRV</text>
<rect x="30" y="130" width="150" height="56" rx="8" fill="#bae6fd"/><text x="105" y="154" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="105" y="172" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.10.0.0/24</text>
<rect x="245" y="130" width="150" height="56" rx="8" fill="#bae6fd"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.20.0.0/24</text>
<rect x="460" y="130" width="150" height="56" rx="8" fill="#bae6fd"/><text x="535" y="154" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="535" y="172" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.30.0.0/24</text>
<line x1="270" y1="66" x2="105" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="66" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><line x1="370" y1="66" x2="535" y2="130" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Wahi package, teen installs (har device ka ek). NAT har LAN ko SRV-WEB tak pahunchata hai.</p></div>

<h3>Task 1: har ek ki teen mappings ke saath objects</h3>
<p><b>Goal:</b> address SRV-WEB (192.0.2.80/32) aur normalized interfaces LAN aur WAN, teeno FortiGates ke liye mapped (LAN port2, WAN port1).</p>
<p><b>Approach:</b> fm-install wali hi tables, par har <code>dynamic-mapping</code> block mein <b>teen</b> rows. Gino: do normalized interfaces aur teen devices, matlab chhe rows. <b>Check:</b> <code>show pm interface</code> mein LAN aur WAN dono ke neeche HQ-FGT, MDU-FGT aur TRY-FGT dikhne chahiye. <b>Wrong turn:</b> HQ-FGT bhool jana kyunki pichhle lab mein sirf branches thi. HQ-FGT ki missing row wahi galti hai jo sirf head office par install karte waqt dikhti hai.</p>

<h3>Task 2: teen installation targets wala package</h3>
<p><b>Goal:</b> package All-Sites, installation targets HQ-FGT, MDU-FGT aur TRY-FGT, policy 1: LAN se WAN, destination SRV-WEB, accept with NAT.</p>
<p><b>Approach:</b> ek <code>set install-target</code> line teen quoted names ke saath. <b>Check:</b> <code>show pm pkg</code>. Output mein teen naam dikhte hain; ek missing ho to baad mein "is not an installation target" message milega. Naming par socho: package sab sites share karti hain, isliye All-Sites Branch-PP se behtar naam hai (chapter 5).</p>

<h3>Task 3: ek ka preview, teen par install</h3>
<p><b>Goal:</b> HQ-FGT ka preview, phir har FortiGate par All-Sites install, aur har PC se test.</p>
<p><b>Approach:</b> pehle <code>install-preview Kaveri All-Sites HQ-FGT</code>. FortiGates par policies nahi hain, isliye address lines aur policy lines dikhti hain. Phir <code>install-package</code> teen baar chalao, har device ke liye ek; install hamesha per device hota hai. Har baar success line padho, revision number samet.</p>
<p>FMG-1 par <code>diagnose dvm device list</code> se <b>verify</b> karo: teeno mein same package dikhta hai.</p>
<pre class="out">FMG-1 # diagnose dvm device list
... HQ-FGT  ... |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: installed; conn: up
                |- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[installed]All-Sites</span>
... MDU-FGT ... |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: installed; conn: up
                |- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[installed]All-Sites</span>
... TRY-FGT ... |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: installed; conn: up
                |- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[installed]All-Sites</span></pre>
<p>Phir PC-HQ, PC-MDU aur PC-TRY se <code>ping 192.0.2.80</code>. Teeno ka jawab aana chahiye. Kisi bhi FortiGate par <code>show firewall policy</code> mein policy 1 LAN-TO-SRV srcintf port2 aur dstintf port1 ke saath dikhni chahiye: normalized names chale gaye aur real ports aa gaye.</p>

<h3>Task 4: ek shabd ka sawal</h3>
<p>Aakhri task poochta hai ki install target ki firewall policy table ke saath kya karta hai: usme jodta hai ya replace karta hai. Aap chapter 4 se jawab jaante ho. Simulator ise dikhata bhi hai: install ke baad HQ-FGT ka preview dobara chalao. Ab device par policy 1 hai, isliye preview ki pehli lines <code>config firewall policy</code> ke andar <code>delete 1</code> hain, phir wahi policy dobara banti hai. Wo delete line replace ko action mein dikhati hai.</p>
<pre class="out">FMG-1 # execute fmgui install-preview Kaveri All-Sites HQ-FGT
Install preview for HQ-FGT (21 CLI lines, nothing is sent to the device):
  config firewall policy
  <span class="hl">delete 1</span>
  end
  config firewall address
  edit "SRV-WEB"
  ...</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Sirf ek device par install karke baaki do PCs test karna. (2) Lab ko "package khud sab targets par install ho jata hai" padhna: install-target permission list hai, automatic push nahi. (3) Install command ke arguments galat order mein likhna (adom, package, device). (4) HQ-FGT ki mapping rows skip karna kyunki head office branches se alag lagta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Installation targets batate hain package kahan ja sakta hai; install khud per device chalta hai. Replace, add nahi: wahi package do baar install karne se policies duplicate nahi hoti. Kai devices ke liye ek package tabhi chalta hai jab har device ke paas package ke har normalized interface ki mapping rows hon.</p></div>

<div class="scn"><h4>Ek hafte mein chaar nayi shops</h4><p>All-Sites design wale ek retailer ne ek hafte mein chaar chhoti shops kholi. Har shop ke liye engineer ne FortiGate authorize kiya, do mapping rows (LAN aur WAN) jodi aur device ka naam install-target mein jodha. Chaar previews, chaar installs, chaar pings. Wahi kaam individual rules se karte to chaar nayi configurations aur typo ke chaar mauke hote.</p><p><b>Lesson:</b> shared package ke saath naya site kuch mapping rows ka kaam hai, nayi configuration ka nahi.</p></div>

<div class="iv"><p class="q">"Ek rule ko das branches par safely kaise roll out karoge?"</p><p>Rule shared package mein ek baar jodo, check karo ki das ke das devices installation targets hain aur unke paas mapping rows hain, ek representative device ka preview lo aur unexpected delete lines dekho, pehle pilot branch par install karo, test karo, phir baaki nau par install karo, aur device list mein installed aur in sync dekho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek address object aur do normalized interfaces sab sites ko serve karte hain; har site ko apni mapping rows chahiye.</li>
<li>Shared package install-target mein har site list karta hai, par har install per device chalta hai.</li>
<li>Success ke baad diagnose dvm device list har device par same pkg:[installed] naam dikhati hai.</li>
<li>Already-installed device ka preview delete lines se shuru hota hai: install table replace karta hai.</li>
<li>Har site ke PC se test karo, sirf ek se nahi.</li>
</ul></div>
`}};export{e as default};