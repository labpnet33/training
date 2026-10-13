var e={id:`lab-fm-tpl-cli`,h:{en:`Lab fm-tpl-cli: one DNS template and one CLI template for two branches`,hi:`Lab fm-tpl-cli: do branches ke liye ek DNS template aur ek CLI template`},body:{en:`
<p>A teacher who prints one worksheet and hands it to two classes saves time, but only if both classes get the same sheet. This lab is about that economy. You write one system template and one CLI template, give them to two FortiGates, and prove that both branches received identical settings. The skill being tested is reuse: one definition, two devices, one install per device.</p>

<h3>The goal</h3>
<p>Kaveri wants MDU-FGT in Madurai and TRY-FGT in Trichy to use the company DNS servers 192.0.2.53 and 192.0.2.54 with the domain kaveri.example, and to know two networks by name: the data centre NK-DC (10.99.0.0/16) and the management network NK-MGMT (192.0.2.0/24). You build the system template KR-DNS and the CLI template KR-OBJECTS in the ADOM Kaveri, assign both to both devices, preview and install. The lab also asks you to name the character that separates the lines of the script: the semicolon.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two templates reach two branches">
<rect x="20" y="25" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">KR-DNS</text><text x="95" y="65" text-anchor="middle" class="svg-muted" font-size="12">system</text>
<rect x="20" y="105" width="150" height="50" rx="8" fill="#fde68a"/><text x="95" y="128" text-anchor="middle" class="svg-ink" font-size="13">KR-OBJECTS</text><text x="95" y="145" text-anchor="middle" class="svg-muted" font-size="12">cli script</text>
<rect x="450" y="25" width="170" height="50" rx="8" fill="#bae6fd"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="535" y="65" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.12</text>
<rect x="450" y="105" width="170" height="50" rx="8" fill="#bae6fd"/><text x="535" y="128" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.13</text>
<line x1="170" y1="50" x2="450" y2="50" stroke="#64748b" stroke-width="2"/><line x1="170" y1="50" x2="450" y2="130" stroke="#64748b" stroke-width="2"/><line x1="170" y1="130" x2="450" y2="130" stroke="#64748b" stroke-width="2"/><line x1="170" y1="130" x2="450" y2="50" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Four assignments from two templates; each device is installed on its own.</p></div>

<h3>Approach</h3>
<p><b>Task 1, assign DNS to both devices.</b> Create KR-DNS once. Then open the device entry of MDU-FGT and set template, and do the same for TRY-FGT. Beginners often create two templates with the same values. That works but defeats the lab: a later DNS change would then need two edits. After the assignment, both devices show <code>dev-db: modified</code>.</p>
<p><b>Task 2, the CLI template.</b> Write one script that creates both address objects: the lines of config firewall address, then an edit, subnet and next block for NK-DC, another block for NK-MGMT, and a closing end. Join the lines with semicolons into the script attribute of a template of kind cli. Assign it with cli-template on both devices. Check the script as you would check a letter before posting: every edit has its next, and the single config has one end.</p>
<p><b>Task 3, preview and install.</b> Preview one branch first. Since the system template runs first, the five DNS lines come before your eight script lines, thirteen in all. Install MDU-FGT, then TRY-FGT. Because install-device acts on one device at a time, you run it twice. Then read the status of both devices and check the objects on the FortiGates.</p>

<h3>Real output to look for</h3>
<pre class="out">FMG-1 # execute fmgui install-preview Kaveri TRY-FGT
Install preview for TRY-FGT (<span class="hl">13 CLI lines</span>, nothing is sent to the device):
  config system dns
  set primary 192.0.2.53
  set secondary 192.0.2.54
  set domain "kaveri.example"
  end
  config firewall address
  edit NK-DC
  set subnet 10.99.0.0 255.255.0.0
  next
  edit NK-MGMT
  set subnet 192.0.2.0 255.255.255.0
  next
  end</pre>
<pre class="out">TRY-FGT # show firewall address
config firewall address
    edit "NK-DC"
        set subnet 10.99.0.0 255.255.0.0
    next
    edit "NK-MGMT"
        set subnet 192.0.2.0 255.255.255.0
    next
end

FMG-1 # diagnose dvm device list
MDU-FGT ... STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: installed
TRY-FGT ... STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: installed</pre>
<p>The lab passes when both FortiGates show the two address objects and the DNS servers, and both show dev-db: not modified. If only one branch is changed, the other still shows modified.</p>

<h3>Why this design is good</h3>
<p>The two branches got identical objects without anyone typing them twice. If the data centre range changes next year, you edit the script once, both devices show modified again, and two installs bring them back in line. The risk is the other side of the same coin: a mistake in the script also lands on both branches. That is why you preview and install one branch first. You can see the whole difference by comparing revision 1 with revision 2 of each device.</p>

<h3>Common wrong turns</h3>
<ul>
<li>Using a comma or a line break instead of the semicolon; the line count in the preview then looks wrong.</li>
<li>Forgetting that the script lines are literal. The address name NK-DC is created exactly as written, so a typo creates an object with the wrong name.</li>
<li>Assigning to MDU-FGT only, then wondering why Trichy stays modified.</li>
<li>Installing one branch and declaring the lab done. The status of both devices decides.</li>
<li>Putting the objects in the script and also in a policy package; the names would clash.</li>
</ul>

<div class="warn"><p><b>Watch for.</b> A script can contain any CLI, so it can also delete. Keep the lab script exactly to the address block, preview it, and do not add extra lines "while you are there".</p></div>

<div class="exam"><p><b>Exam traps.</b> One template can be assigned to many devices; the install is still per device in this simulator. The script separator is the semicolon in the simulator. A system template runs before a CLI template whichever you assigned first.</p></div>

<div class="scn"><h4>The data centre range changed</h4><p>Kaveri moved its data centre from 10.99.0.0/16 to 10.98.0.0/16 and asked for the object NK-DC to follow. The engineer edited one line in the template KR-OBJECTS. Both branches immediately showed dev-db: modified. A preview on one branch showed the new subnet, and two installs updated both. A third branch added a month later only needed the cli-template assignment.</p><p><b>Lesson:</b> a shared template turns a multi-device change into one edit plus one install per device.</p></div>

<div class="iv"><p class="q">"How do you make sure two branches got exactly the same objects?"</p><p>Assign one template to both, install both, and compare. The status shows dev-db not modified on each, the show output on each FortiGate lists the same objects, and the revision diff between the first two revisions of each device shows the same added lines. Mention that a shared template also shares its mistakes, so you preview and install one device first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One template can be assigned to many devices; each device is installed separately.</li>
<li>The preview line count adds up: five DNS lines plus eight script lines made thirteen.</li>
<li>A semicolon separates the lines of a CLI template script in the simulator.</li>
<li>Both devices must show dev-db: not modified and the same objects.</li>
<li>Shared templates share mistakes too, so preview and start with one device.</li>
</ul></div>
`,hi:`
<p>Jo teacher ek worksheet print karke do classes ko deta hai wo time bachata hai, par tabhi jab dono classes ko wahi sheet mile. Ye lab isi bachat ke baare mein hai. Aap ek system template aur ek CLI template likhte ho, do FortiGates ko dete ho, aur sabit karte ho ki dono branches ko identical settings mili. Jo skill test hoti hai wo reuse hai: ek definition, do devices, har device par ek install.</p>

<h3>Goal</h3>
<p>Kaveri chahta hai ki Madurai ka MDU-FGT aur Trichy ka TRY-FGT company DNS servers 192.0.2.53 aur 192.0.2.54 domain kaveri.example ke saath use karein, aur do networks naam se jaanein: data centre NK-DC (10.99.0.0/16) aur management network NK-MGMT (192.0.2.0/24). Aap ADOM Kaveri mein system template KR-DNS aur CLI template KR-OBJECTS banate ho, dono dono devices ko assign karte ho, preview aur install karte ho. Lab ye bhi puchta hai ki script ki lines kaunsa character alag karta hai: semicolon.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Do templates do branches tak pahunchte hain">
<rect x="20" y="25" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">KR-DNS</text><text x="95" y="65" text-anchor="middle" class="svg-muted" font-size="12">system</text>
<rect x="20" y="105" width="150" height="50" rx="8" fill="#fde68a"/><text x="95" y="128" text-anchor="middle" class="svg-ink" font-size="13">KR-OBJECTS</text><text x="95" y="145" text-anchor="middle" class="svg-muted" font-size="12">cli script</text>
<rect x="450" y="25" width="170" height="50" rx="8" fill="#bae6fd"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="535" y="65" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.12</text>
<rect x="450" y="105" width="170" height="50" rx="8" fill="#bae6fd"/><text x="535" y="128" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.13</text>
<line x1="170" y1="50" x2="450" y2="50" stroke="#64748b" stroke-width="2"/><line x1="170" y1="50" x2="450" y2="130" stroke="#64748b" stroke-width="2"/><line x1="170" y1="130" x2="450" y2="130" stroke="#64748b" stroke-width="2"/><line x1="170" y1="130" x2="450" y2="50" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Do templates se chaar assignments; har device alag install hota hai.</p></div>

<h3>Approach</h3>
<p><b>Task 1, dono devices ko DNS assign karo.</b> KR-DNS ek baar banao. Phir MDU-FGT ki device entry kholkar template set karo, aur TRY-FGT ke liye bhi yahi karo. Beginners aksar same values wale do templates bana dete hain. Ye chalta hai par lab ka maqsad khatam kar deta hai: baad mein DNS change ke liye do edits lagenge. Assignment ke baad dono devices <code>dev-db: modified</code> dikhate hain.</p>
<p><b>Task 2, CLI template.</b> Ek script likho jo dono address objects banaye: config firewall address ki lines, phir NK-DC ke liye edit, subnet aur next block, NK-MGMT ke liye doosra block, aur closing end. Lines ko semicolons se jodkar kind cli wale template ke script attribute mein daalo. Dono devices par cli-template se assign karo. Script ko waise check karo jaise post karne se pehle chitthi: har edit ka next hai, aur single config ka ek end.</p>
<p><b>Task 3, preview aur install.</b> Pehle ek branch ka preview lo. System template pehle chalta hai, isliye paanch DNS lines aapki aath script lines se pehle aati hain, kul terah. MDU-FGT install karo, phir TRY-FGT. Install-device ek samay mein ek device par chalta hai, isliye do baar chalate ho. Phir dono devices ka status padho aur FortiGates par objects check karo.</p>

<h3>Real output jo dekhna hai</h3>
<pre class="out">FMG-1 # execute fmgui install-preview Kaveri TRY-FGT
Install preview for TRY-FGT (<span class="hl">13 CLI lines</span>, nothing is sent to the device):
  config system dns
  set primary 192.0.2.53
  set secondary 192.0.2.54
  set domain "kaveri.example"
  end
  config firewall address
  edit NK-DC
  set subnet 10.99.0.0 255.255.0.0
  next
  edit NK-MGMT
  set subnet 192.0.2.0 255.255.255.0
  next
  end</pre>
<pre class="out">TRY-FGT # show firewall address
config firewall address
    edit "NK-DC"
        set subnet 10.99.0.0 255.255.0.0
    next
    edit "NK-MGMT"
        set subnet 192.0.2.0 255.255.255.0
    next
end

FMG-1 # diagnose dvm device list
MDU-FGT ... STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: installed
TRY-FGT ... STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: installed</pre>
<p>Lab tab pass hota hai jab dono FortiGates par dono address objects aur DNS servers dikhte hain, aur dono dev-db: not modified dikhate hain. Sirf ek branch badli ho to doosri abhi bhi modified dikhati hai.</p>

<h3>Ye design achha kyun hai</h3>
<p>Dono branches ko identical objects mile bina kisi ne unhe do baar type kiye. Agle saal data centre range badle to aap script ek baar edit karte ho, dono devices phir modified dikhate hain, aur do installs unhe line par le aate hain. Risk usi sikke ka doosra pehlu hai: script ki galti dono branches par bhi pahunchti hai. Isliye pehle ek branch par preview aur install karte ho. Poora difference har device ke revision 1 aur revision 2 compare karke dikh jata hai.</p>

<h3>Common wrong turns</h3>
<ul>
<li>Semicolon ki jagah comma ya line break use karna; tab preview ki line count galat dikhti hai.</li>
<li>Ye bhool jana ki script lines literal hoti hain. Address name NK-DC bilkul waisa hi banta hai jaisa likha, isliye typo galat naam ka object bana deta hai.</li>
<li>Sirf MDU-FGT ko assign karna, phir sochna ki Trichy modified kyun hai.</li>
<li>Ek branch install karke lab khatam maan lena. Dono devices ka status decide karta hai.</li>
<li>Objects ko script mein bhi aur policy package mein bhi daalna; names takra jayenge.</li>
</ul>

<div class="warn"><p><b>Dhyan do.</b> Script mein koi bhi CLI ho sakta hai, to wo delete bhi kar sakti hai. Lab script ko bilkul address block tak rakho, preview karo, aur "jab yahan hain to" wali extra lines mat jodo.</p></div>

<div class="exam"><p><b>Exam traps.</b> Ek template kai devices ko assign ho sakta hai; is simulator mein install phir bhi per device hota hai. Simulator mein script separator semicolon hai. System template CLI template se pehle chalta hai chahe assign pehle koi bhi kiya ho.</p></div>

<div class="scn"><h4>Data centre range badal gayi</h4><p>Kaveri ne data centre 10.99.0.0/16 se 10.98.0.0/16 mein shift kiya aur chaha ki object NK-DC bhi saath badle. Engineer ne template KR-OBJECTS ki ek line edit ki. Dono branches turant dev-db: modified dikhane lagi. Ek branch ke preview ne naya subnet dikhaya, aur do installs ne dono ko update kiya. Ek mahine baad jodi teesri branch ko sirf cli-template assignment chahiye thi.</p><p><b>Lesson:</b> shared template multi-device change ko ek edit aur har device par ek install bana deta hai.</p></div>

<div class="iv"><p class="q">"Kaise pakka karoge ki do branches ko bilkul same objects mile?"</p><p>Ek template dono ko assign, dono install, aur compare. Status har ek par dev-db not modified dikhata hai, har FortiGate ka show output wahi objects list karta hai, aur har device ke pehle do revisions ke beech revision diff wahi added lines dikhata hai. Ye bhi bolo ki shared template apni galtiyan bhi share karta hai, isliye pehle ek device par preview aur install karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek template kai devices ko assign hota hai; har device alag install hota hai.</li>
<li>Preview line count jodta hai: paanch DNS lines plus aath script lines barabar terah.</li>
<li>Simulator mein CLI template script ki lines semicolon alag karta hai.</li>
<li>Dono devices par dev-db: not modified aur same objects hone chahiye.</li>
<li>Shared templates galtiyan bhi share karte hain, isliye preview lo aur ek device se shuru karo.</li>
</ul></div>
`}};export{e as default};