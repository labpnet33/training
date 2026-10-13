var e={id:`drift-trap`,h:{en:`The drift trap: an install replaces the policy table`,hi:`Drift trap: install policy table ko replace kar deta hai`},body:{en:`
<p>A teacher hands out a printed attendance sheet every morning. During the day a student adds her name by hand at the bottom because she came late. The next morning the teacher prints a fresh sheet from the school register and the handwritten line is gone, not because the teacher disliked it, but because the printout only contains what the register contains. An install of a policy package works like that printout.</p>

<h3>What an install does to the policy table</h3>
<p>The <b>policy table</b> is the list of firewall policies on a FortiGate. When you install a package, FortiManager does not try to merge the package with what is on the device. It makes the device table equal to the package. In the order of operations that you saw in fmg-policy, the policies on the device are deleted first, the address objects used by the package are installed, and then the package policies are created. Whatever lived on the device and is not in the package disappears.</p>
<p>This is a good thing when you want consistency. It is the reason a central manager removes drift. It is also the reason why a local emergency policy is dangerous: it is invisible to the package, so the install treats it as drift and removes it.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Install replaces the table">
<rect x="30" y="30" width="170" height="110" rx="8" fill="#bae6fd"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT before</text><text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="12">policy 1 LAN-TO-SRV</text><text x="115" y="100" text-anchor="middle" class="svg-accent" font-size="12">policy 99 TEMP-SSH</text>
<rect x="235" y="50" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">Branch-PP</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">policy 1 only</text>
<rect x="440" y="30" width="170" height="110" rx="8" fill="#bbf7d0"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT after</text><text x="525" y="80" text-anchor="middle" class="svg-muted" font-size="12">policy 1 LAN-TO-SRV</text><text x="525" y="100" text-anchor="middle" class="svg-muted" font-size="12">(99 is gone)</text>
<line x1="200" y1="85" x2="235" y2="85" stroke="#64748b" stroke-width="2"/><line x1="405" y1="85" x2="440" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">the device ends up equal to the package</text>
</svg><p class="cap">An install is a replacement, not a merge.</p></div>

<h3>Seeing the danger before it happens</h3>
<p>The install preview prints the CLI that would be sent, and nothing is sent to the device. It is the cheapest protection you have. In the lab situation, the preview of Branch-PP on MDU-FGT after the local change shows the delete lines at the top. In the real product the preview is a GUI feature; the simulator offers it as <code>execute fmgui install-preview</code>.</p>
<pre class="code"><span class="c">! on FMG-1</span>
execute fmgui install-preview Kaveri Branch-PP MDU-FGT</pre>
<pre class="out">Install preview for MDU-FGT (22 CLI lines, nothing is sent to the device):
  config firewall policy
  <span class="hl">delete 1</span>
  <span class="hl">delete 99</span>
  end
  config firewall address
  edit "SRV-WEB"
  ...</pre>
<p>Read the delete lines like a warning label. Policy 1 is deleted and created again, which is normal. Policy 99 is deleted and never created again. That is the loss, and it is visible before you press the button.</p>

<h3>The safe order: import before install</h3>
<p><b>Import-policy</b> reads the policies and objects that exist on a device and builds a new policy package from them. Used after a local change, it turns the emergency rule into something the package knows. Then the install keeps it.</p>
<ol>
<li>Notice the change (conf out of sync, or a new auto update revision).</li>
<li>Import the device policies into a new package, for example MDU-Keep.</li>
<li>Install MDU-Keep on the device.</li>
</ol>
<pre class="code"><span class="c">! on FMG-1 (GUI or API actions in the real product)</span>
execute fmgui import-policy Kaveri MDU-FGT MDU-Keep
execute fmgui install-package Kaveri MDU-Keep MDU-FGT</pre>
<pre class="out">Import finished: policy package MDU-Keep created in ADOM Kaveri with <span class="hl">2 policies</span> and 1 address objects (installation target MDU-FGT).
Starting installation to MDU-FGT (ADOM Kaveri)...
  policy package: MDU-Keep installed (2 policies)
Task 2: install finished with status success. Revision 4 created.</pre>
<p>Two policies: the original and TEMP-SSH. Afterwards the policy table on MDU-FGT still lists both. The revision history gets one more line, revision 4, created by install.</p>

<div class="eg"><p><b>Worked example.</b> In the simulator we also installed Branch-PP again after MDU-Keep, to prove the point. The result: the FortiGate lost policy 99 and revision 5 was written. Nothing was wrong with FortiManager; Branch-PP simply never contained the rule. Note a detail of this lab: both packages list MDU-FGT as an installation target, so the pkg field keeps naming the older package. In a real design you would also take MDU-FGT out of the old package's targets, so nobody installs it by mistake.</p></div>

<h3>Why it matters</h3>
<p>The trap is not a bug. It is the price of central control. If an install were a merge, drift would pile up forever. The skill you need is to decide, every time you see local changes, whether they should live (import them) or go (let the install remove them), and to make that decision before the install, not after.</p>

<div class="warn"><p><b>Common mistakes.</b> Installing "just to make it green" when conf is out of sync. Skipping the preview on a branch that has had emergency work. Importing into the existing package name without thinking: in this course a new package keeps the original untouched. Forgetting that an import brings in everything local, including changes nobody wanted.</p></div>

<div class="exam"><p><b>Exam traps.</b> An install replaces the policy table of the device; it does not merge. Import before install keeps local policies. The preview is the check; it sends nothing. A failed install changes nothing, but a successful one removes local policies without asking.</p></div>

<div class="scn"><h4>Friday's install and Saturday's outage</h4><p>A retailer pushed a small package fix to all branches on Friday evening. One branch had a local policy that allowed a card machine vendor over SSH. It disappeared silently. On Saturday the vendor could not connect, the shop could not take card payments for two hours, and the team spent that time searching for a link problem. The install preview that nobody had opened would have shown the delete line.</p><p><b>Lesson:</b> always read the preview on devices that show conf out of sync, and import what must survive.</p></div>

<div class="iv"><p class="q">"A colleague typed an emergency policy on a managed FortiGate. How do you keep it?"</p><p>Auto update records it, but the package does not contain it, so the next install would delete it. I import the policies of the device into a new package, check that the package contains the rule, preview, and then install that package. Afterwards I remove the device from the old package's targets and open a change record.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An install makes the device policy table equal to the package; it does not merge.</li>
<li>Local policies that are not in the package are removed by the next install.</li>
<li>The install preview shows the delete lines before anything is sent.</li>
<li>Import the device policies into a new package, then install that package.</li>
<li>Decide keep or remove before the install, not after.</li>
</ul></div>
`,hi:`
<p>Teacher har subah printed attendance sheet baantta hai. Din mein ek student der se aane par haath se neeche apna naam likh deti hai. Agli subah teacher school register se nayi sheet print karta hai aur haath se likhi line gayab hai, isliye nahi ki teacher ko wo pasand nahi thi, balki isliye ki printout mein sirf wahi hai jo register mein hai. Policy package ka install bhi aise hi printout ki tarah kaam karta hai.</p>

<h3>Install policy table ke saath kya karta hai</h3>
<p><b>Policy table</b> FortiGate par firewall policies ki list hai. Package install karte waqt FortiManager package ko device ke saath merge karne ki koshish nahi karta. Wo device table ko package ke barabar bana deta hai. Order of operations mein, jo aapne fmg-policy mein dekha, pehle device ki policies delete hoti hain, package ke use kiye address objects install hote hain, phir package policies create hoti hain. Jo device par tha aur package mein nahi, wo gayab ho jata hai.</p>
<p>Consistency chahiye to ye achhi baat hai. Isi wajah se central manager drift hatata hai. Isi wajah se local emergency policy khatarnak hai: wo package ko dikhti nahi, isliye install use drift maanta hai aur hata deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Install table replace karta hai">
<rect x="30" y="30" width="170" height="110" rx="8" fill="#bae6fd"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT pehle</text><text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="12">policy 1 LAN-TO-SRV</text><text x="115" y="100" text-anchor="middle" class="svg-accent" font-size="12">policy 99 TEMP-SSH</text>
<rect x="235" y="50" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">Branch-PP</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">sirf policy 1</text>
<rect x="440" y="30" width="170" height="110" rx="8" fill="#bbf7d0"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT baad mein</text><text x="525" y="80" text-anchor="middle" class="svg-muted" font-size="12">policy 1 LAN-TO-SRV</text><text x="525" y="100" text-anchor="middle" class="svg-muted" font-size="12">(99 gayab)</text>
<line x1="200" y1="85" x2="235" y2="85" stroke="#64748b" stroke-width="2"/><line x1="405" y1="85" x2="440" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">device package ke barabar ban jata hai</text>
</svg><p class="cap">Install replacement hai, merge nahi.</p></div>

<h3>Khatra hone se pehle dekhna</h3>
<p>Install preview wo CLI print karta hai jo bheji jayegi, aur device ko kuch nahi bheja jata. Ye aapki sabse sasti suraksha hai. Lab situation mein local change ke baad MDU-FGT par Branch-PP ka preview upar delete lines dikhata hai. Real product mein preview GUI feature hai; simulator ise <code>execute fmgui install-preview</code> ki tarah deta hai.</p>
<pre class="code"><span class="c">! on FMG-1</span>
execute fmgui install-preview Kaveri Branch-PP MDU-FGT</pre>
<pre class="out">Install preview for MDU-FGT (22 CLI lines, nothing is sent to the device):
  config firewall policy
  <span class="hl">delete 1</span>
  <span class="hl">delete 99</span>
  end
  config firewall address
  edit "SRV-WEB"
  ...</pre>
<p>Delete lines ko warning label ki tarah padho. Policy 1 delete hoti hai aur dobara banti hai, jo normal hai. Policy 99 delete hoti hai aur dobara nahi banti. Wahi nuksan hai, aur button dabane se pehle dikh jata hai.</p>

<h3>Safe order: install se pehle import</h3>
<p><b>Import-policy</b> device par maujood policies aur objects ko padhkar unse naya policy package banata hai. Local change ke baad use karo to emergency rule ko aisi cheez bana deta hai jise package jaanta hai. Phir install use rakhta hai.</p>
<ol>
<li>Change notice karo (conf out of sync, ya nayi auto update revision).</li>
<li>Device policies ko naye package mein import karo, jaise MDU-Keep.</li>
<li>MDU-Keep ko device par install karo.</li>
</ol>
<pre class="code"><span class="c">! on FMG-1 (real product mein GUI ya API actions)</span>
execute fmgui import-policy Kaveri MDU-FGT MDU-Keep
execute fmgui install-package Kaveri MDU-Keep MDU-FGT</pre>
<pre class="out">Import finished: policy package MDU-Keep created in ADOM Kaveri with <span class="hl">2 policies</span> and 1 address objects (installation target MDU-FGT).
Starting installation to MDU-FGT (ADOM Kaveri)...
  policy package: MDU-Keep installed (2 policies)
Task 2: install finished with status success. Revision 4 created.</pre>
<p>Do policies: original aur TEMP-SSH. Baad mein MDU-FGT ki policy table mein dono dikhti hain. Revision history mein ek line aur judti hai, revision 4, install se bani.</p>

<div class="eg"><p><b>Worked example.</b> Simulator mein humne baat pakki karne ke liye MDU-Keep ke baad Branch-PP dobara install kiya. Result: FortiGate ne policy 99 kho di aur revision 5 likhi gayi. FortiManager mein kuch galat nahi tha; Branch-PP mein wo rule kabhi tha hi nahi. Is lab ki ek detail dhyaan do: dono packages MDU-FGT ko installation target ginte hain, isliye pkg field purane package ka naam dikhata rehta hai. Real design mein aap MDU-FGT ko purane package ke targets se bhi hata doge, taaki koi galti se install na kare.</p></div>

<h3>Ye kyun zaroori hai</h3>
<p>Ye trap bug nahi hai. Ye central control ki keemat hai. Agar install merge hota to drift hamesha jama hota rehta. Aapko ye skill chahiye: har baar local changes dikhein to decide karo ki wo rahenge (import karo) ya jayenge (install hata dega), aur ye decision install se pehle lo, baad mein nahi.</p>

<div class="warn"><p><b>Common mistakes.</b> Conf out of sync hone par "bas green karne ke liye" install karna. Emergency kaam wale branch par preview skip karna. Bina socha existing package ke naam mein import karna: is course mein naya package original ko chhua nahi chhodta. Ye bhoolna ki import saari local cheezein laata hai, wo bhi jo kisi ne nahi chahi thi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Install device ki policy table ko replace karta hai; merge nahi karta. Install se pehle import local policies ko rakhta hai. Preview check hai; wo kuch nahi bhejta. Failed install kuch nahi badalta, par successful install bina poochhe local policies hata deta hai.</p></div>

<div class="scn"><h4>Shukrawar ka install aur Shanivar ka outage</h4><p>Ek retailer ne shukrawar shaam sab branches par chhota package fix push kiya. Ek branch par local policy thi jo card machine vendor ko SSH deti thi. Wo chupchap gayab ho gayi. Shanivar ko vendor connect nahi kar paya, shop do ghante card payments nahi le saka, aur team ne wo waqt link problem dhoondhne mein gaya. Install preview, jo kisi ne kholi nahi, delete line dikha deta.</p><p><b>Lesson:</b> jin devices par conf out of sync dikhe, unka preview hamesha padho, aur jo bachana hai use import karo.</p></div>

<div class="iv"><p class="q">"Colleague ne managed FortiGate par emergency policy type ki. Use kaise rakhoge?"</p><p>Auto update use record karta hai, par package mein nahi hai, to agla install use delete kar dega. Main device ki policies ko naye package mein import karta hoon, check karta hoon ki package mein rule hai, preview karta hoon, phir wo package install karta hoon. Baad mein device ko purane package ke targets se hata deta hoon aur change record kholta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Install device policy table ko package ke barabar banata hai; merge nahi karta.</li>
<li>Jo local policies package mein nahi, unhe agla install hata deta hai.</li>
<li>Install preview kuch bhejne se pehle delete lines dikha deta hai.</li>
<li>Device policies ko naye package mein import karo, phir wo package install karo.</li>
<li>Keep ya remove ka decision install se pehle lo, baad mein nahi.</li>
</ul></div>
`}};export{e as default};