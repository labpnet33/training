var e={id:`troubleshooting`,h:{en:`Troubleshooting: the compliance report says FAIL`,hi:`Troubleshooting: compliance report FAIL kehti hai`},body:{en:`<p>This chapter walks through Lab 2. The nightly job <code>check.py</code> is red on all three devices, the on-call engineer is tired, and the temptation is to change whatever makes the red go away. Do not. A FAIL is a disagreement between two things, the <b>validation file</b> and the <b>device</b>, and a third thing, the <b>script</b>, can stop them from even being compared. Your job is to decide which one is wrong, and fix only that.</p>

<h3>The method</h3>
<ol>
<li><b>Does it run?</b> An exception before any comparison means the script or its inputs are broken, not the network.</li>
<li><b>Read the first path.</b> The line under each FAIL names the getter and the key that differs.</li>
<li><b>Ask the source of truth.</b> The design document or the change ticket decides who is right, not the file and not the device.</li>
<li><b>Fix the smallest thing on the wrong side</b>: one line in the file, or one change to the device through the safe tool.</li>
<li><b>Run everything again</b> and check the exit code, not just your own device.</li></ol>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Who is wrong">
<rect x="230" y="8" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">check.py says FAIL</text>
<line x1="320" y1="48" x2="320" y2="66" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="66" width="240" height="40" rx="8" fill="#fde68a"/><text x="320" y="91" text-anchor="middle" class="svg-ink" font-size="13">does the design agree with...</text>
<line x1="260" y1="106" x2="150" y2="130" stroke="#64748b" stroke-width="2"/><line x1="380" y1="106" x2="490" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="130" width="220" height="44" rx="8" fill="#bbf7d0"/><text x="150" y="149" text-anchor="middle" class="svg-ink" font-size="13">the device: fix the FILE</text><text x="150" y="165" text-anchor="middle" class="svg-muted" font-size="10">typo, stale value</text>
<rect x="380" y="130" width="220" height="44" rx="8" fill="#fed7aa"/><text x="490" y="149" text-anchor="middle" class="svg-ink" font-size="13">the file: fix the DEVICE</text><text x="490" y="165" text-anchor="middle" class="svg-muted" font-size="10">drift, rogue line</text>
</svg><p class="cap">The design decides. The report only says that two things disagree.</p></div>

<h3>Step 1: it does not even compare</h3>
<pre class="out">AUTO01$ python3 check.py; echo "exit code: $?"
R1: <span class="hl">ValidationException: File validate/R1.yaml not found.</span>
J1: ValidationException: File validate/J1.yaml not found.
E1: ValidationException: File validate/E1.yaml not found.
exit code: 1</pre>
<p>All three devices stop with <code>ValidationException</code> and the exit code is 1. No device was judged; the script asks for <code>validate/R1.yaml</code>, while <code>ls validate</code> shows the files end in <code>.yml</code>. This is fault one, and it is in the <b>script</b>. One line fixes it:</p>
<pre class="code">AUTO01$ sed -i 's/\\.yaml/.yml/' check.py</pre>
<p>Never "fix" this by renaming the three files: other jobs may read them by their right name.</p>

<h3>Step 2: a value that differs (fix the file)</h3>
<p>After the fix the report is real. R1 fails on <code>get_bgp_neighbors/global/peers/10.99.0.11/remote_as: expected 65020, device has 65002</code> (the full output is in chapter 9). The design sheet says that peer is AS 65002, and the device agrees, so the file has a typo.</p>
<pre class="code">AUTO01$ sed -i 's/remote_as: 65020/remote_as: 65002/' validate/R1.yml</pre>
<pre class="out">AUTO01$ python3 check.py
R1: PASS  failed=[] skipped=[]
J1: FAIL  failed=['get_ntp_servers'] skipped=['get_vlans']</pre>
<p>R1 now says PASS. Fault two was in the <b>file</b>; the router was never touched.</p>

<h3>Step 3: a member that is missing (fix the device)</h3>
<p>J1 reports <code>get_ntp_servers: missing ['10.99.0.61']</code>. The change ticket CHG-2043 says every Junos router carries two NTP servers, so here the file is right and the device drifted. The fix is a normal change through the tool of chapter 7, with its diff:</p>
<pre class="out">AUTO01$ python3 ntpsync.py J1 --apply
J1: diff before commit
[edit system ntp]
+   server 10.99.0.61;
J1: committed and verified: ['10.99.0.60', '10.99.0.61']</pre>
<pre class="out">AUTO01$ python3 check.py
R1: PASS  failed=[] skipped=[]
J1: PASS  failed=[] skipped=['get_vlans']
E1: FAIL  failed=['get_ntp_servers'] skipped=[]
    get_ntp_servers: extra ['10.99.0.99']</pre>
<p>The tool printed the diff, committed with a timer, verified, and confirmed; the next report passes J1. Fault three was on the <b>device</b>. It is the same <code>ntpsync.py</code> you built in Lab 1: a good tool gets reused.</p>

<h3>Step 4: a member that is extra (fix the device, carefully)</h3>
<p>E1 reports <code>get_ntp_servers: extra ['10.99.0.99']</code>. The file marks that getter <code>_mode: strict</code>, so any server nobody approved is a failure. Nobody approved 10.99.0.99, so it goes. The tool of chapter 7 only merges, so it cannot remove a line; use the switch's own CLI or a replace with a diff you review. In the lab:</p>
<pre class="code">E1&gt; enable
E1# configure terminal
E1(config)# no ntp server 10.99.0.99
E1(config)# end
E1# write memory</pre>
<pre class="out">AUTO01$ python3 check.py
R1: PASS  failed=[] skipped=[]
J1: PASS  failed=[] skipped=['get_vlans']
E1: PASS  failed=[] skipped=[]</pre>
<p>Now all three say PASS, but look at J1's line: <code>skipped=['get_vlans']</code>.</p>

<h3>Step 5: a rule that never ran</h3>
<p>The Junos driver raises <code>NotImplementedError</code> for <code>get_vlans</code>, so the stanza in J1.yml protects nothing, and it flatters the report. Remove it and run again:</p>
<pre class="code">AUTO01$ sed -i '/get_vlans/d' validate/J1.yml</pre>
<pre class="out">AUTO01$ python3 check.py; echo "exit code: $?"
R1: PASS  failed=[] skipped=[]
J1: PASS  failed=[] skipped=[]
E1: PASS  failed=[] skipped=[]
<span class="hl">exit code: 0</span></pre>
<p>Three PASS, nothing skipped, exit code <code>0</code>. Four faults (script, file, two devices) plus one hygiene item, and each was fixed on the correct side.</p>

<h3>Other errors you will meet in this module</h3>
<table class="cmp"><tr><th>Exception</th><th>Where</th><th>Meaning</th></tr>
<tr><td><code>ModuleImportError</code></td><td><code>get_network_driver</code></td><td>Unknown driver name</td></tr>
<tr><td><code>ConnectionException</code></td><td><code>open()</code></td><td>Auth failed, host down, API off</td></tr>
<tr><td><code>MergeConfigException</code></td><td>load or commit</td><td>The device refused the candidate</td></tr>
<tr><td><code>ReplaceConfigException</code></td><td>load or commit</td><td>Same, for a replace</td></tr>
<tr><td><code>CommitConfirmException</code></td><td><code>commit_config</code>, <code>confirm_commit</code></td><td>Pending confirm already, or none</td></tr>
<tr><td><code>NotImplementedError</code></td><td>getters, <code>revert_in</code></td><td>The driver cannot do this</td></tr>
<tr><td><code>ValidationException</code></td><td><code>compliance_report</code></td><td>Validation file missing or not valid YAML</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Editing the device to make a typo in the file go green; editing the file to hide real drift; fixing one device and not re-running the whole job; accepting <code>skipped</code> forever.</p></div>

<div class="exam"><p><b>Exam trap.</b> "complies is True but the job is useless." Check <code>skipped</code> and the strictness of the file.</p></div>

<div class="scn"><h4>Red every night, ignored every morning</h4><p>A compliance job had been red for a week because of one stale expectation, so the team stopped reading it. The week a real drift appeared (an extra static route), nobody noticed, because red was normal. They fixed the file, got the job to exit 0, and made any non-zero exit page the on-call.</p><p><b>Lesson:</b> a check that is always red is the same as no check. Keep it green by fixing the right side, then alert on red.</p></div>

<div class="iv"><p class="q">"The compliance job fails. What do you do first?"</p><p>I check whether it ran at all or died with an exception such as ValidationException. Then I read the failing path, compare it with the design or ticket to decide whether the file or the device is wrong, fix that side with the smallest change, and rerun the whole job.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FAIL is a disagreement; the design decides who is wrong.</li>
<li>Exceptions before comparison point at the script or its inputs.</li>
<li>Missing and extra members are fixed on the device; a typo is fixed in the file.</li>
<li>Remove rules that are always skipped.</li>
<li>Re-run everything and read the exit code.</li></ul></div>`,hi:`<p>Yeh chapter Lab 2 ka walkthrough hai. Nightly job <code>check.py</code> teeno devices par laal hai, on-call engineer thaka hua hai, aur lalach hai ki jo bhi laal ko hatayega use badal do. Mat karo. FAIL do cheezon ke beech asahmati hai, <b>validation file</b> aur <b>device</b>, aur teesri cheez, <b>script</b>, unhe compare hone se bhi rok sakti hai. Aapka kaam tay karna hai ki kaun galat hai, aur sirf wahi theek karna.</p>

<h3>Tareeka</h3>
<ol>
<li><b>Kya chalta hai?</b> Comparison se pehle exception ka matlab script ya uske inputs toote hain, network nahi.</li>
<li><b>Pehla path padho.</b> Har FAIL ke neeche ki line getter aur woh key batati hai jo alag hai.</li>
<li><b>Source of truth se poocho.</b> Design document ya change ticket tay karta hai kaun sahi hai, file ya device nahi.</li>
<li><b>Galat taraf ki sabse chhoti cheez theek karo</b>: file ki ek line, ya safe tool se device ka ek change.</li>
<li><b>Sab kuch dobara chalao</b> aur exit code dekho, sirf apna device nahi.</li></ol>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Kaun galat hai">
<rect x="230" y="8" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">check.py FAIL kehti hai</text>
<line x1="320" y1="48" x2="320" y2="66" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="66" width="240" height="40" rx="8" fill="#fde68a"/><text x="320" y="91" text-anchor="middle" class="svg-ink" font-size="13">kya design is se sahmat hai...</text>
<line x1="260" y1="106" x2="150" y2="130" stroke="#64748b" stroke-width="2"/><line x1="380" y1="106" x2="490" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="130" width="220" height="44" rx="8" fill="#bbf7d0"/><text x="150" y="149" text-anchor="middle" class="svg-ink" font-size="13">device sahi: FILE theek karo</text><text x="150" y="165" text-anchor="middle" class="svg-muted" font-size="10">typo, purani value</text>
<rect x="380" y="130" width="220" height="44" rx="8" fill="#fed7aa"/><text x="490" y="149" text-anchor="middle" class="svg-ink" font-size="13">file sahi: DEVICE theek karo</text><text x="490" y="165" text-anchor="middle" class="svg-muted" font-size="10">drift, rogue line</text>
</svg><p class="cap">Design tay karta hai. Report sirf kehti hai ki do cheezein asahmat hain.</p></div>

<h3>Step 1: compare hi nahi hota</h3>
<pre class="out">AUTO01$ python3 check.py; echo "exit code: $?"
R1: <span class="hl">ValidationException: File validate/R1.yaml not found.</span>
J1: ValidationException: File validate/J1.yaml not found.
E1: ValidationException: File validate/E1.yaml not found.
exit code: 1</pre>
<p>Teeno devices <code>ValidationException</code> par ruk jaate hain aur exit code 1 hai. Kisi device ka faisla nahi hua; script <code>validate/R1.yaml</code> maangti hai, jabki <code>ls validate</code> dikhata hai files <code>.yml</code> par khatam hoti hain. Yeh pehla fault hai, aur <b>script</b> mein hai. Ek line theek karti hai:</p>
<pre class="code">AUTO01$ sed -i 's/\\.yaml/.yml/' check.py</pre>
<p>Ise kabhi teen files ka naam badalkar "theek" mat karo: doosre jobs unhe sahi naam se padh rahe ho sakte hain.</p>

<h3>Step 2: value jo alag hai (file theek karo)</h3>
<p>Fix ke baad report asli hai. R1 <code>get_bgp_neighbors/global/peers/10.99.0.11/remote_as: expected 65020, device has 65002</code> par fail hota hai (poora output chapter 9 mein hai). Design sheet kehti hai woh peer AS 65002 hai, aur device sahmat hai, isliye file mein typo hai.</p>
<pre class="code">AUTO01$ sed -i 's/remote_as: 65020/remote_as: 65002/' validate/R1.yml</pre>
<pre class="out">AUTO01$ python3 check.py
R1: PASS  failed=[] skipped=[]
J1: FAIL  failed=['get_ntp_servers'] skipped=['get_vlans']</pre>
<p>R1 ab PASS kehta hai. Doosra fault <b>file</b> mein tha; router ko kabhi chhua nahi gaya.</p>

<h3>Step 3: member jo missing hai (device theek karo)</h3>
<p>J1 <code>get_ntp_servers: missing ['10.99.0.61']</code> report karta hai. Change ticket CHG-2043 kehta hai har Junos router par do NTP servers hain, isliye yahan file sahi hai aur device drift ho gaya. Fix chapter 7 ke tool se normal change hai, uske diff ke saath:</p>
<pre class="out">AUTO01$ python3 ntpsync.py J1 --apply
J1: diff before commit
[edit system ntp]
+   server 10.99.0.61;
J1: committed and verified: ['10.99.0.60', '10.99.0.61']</pre>
<pre class="out">AUTO01$ python3 check.py
R1: PASS  failed=[] skipped=[]
J1: PASS  failed=[] skipped=['get_vlans']
E1: FAIL  failed=['get_ntp_servers'] skipped=[]
    get_ntp_servers: extra ['10.99.0.99']</pre>
<p>Tool ne diff print kiya, timer ke saath commit kiya, verify kiya, aur confirm kiya; agli report J1 ko pass karti hai. Teesra fault <b>device</b> par tha. Yeh wahi <code>ntpsync.py</code> hai jo aapne Lab 1 mein banayi: achcha tool dobara kaam aata hai.</p>

<h3>Step 4: member jo extra hai (device theek karo, savdhani se)</h3>
<p>E1 <code>get_ntp_servers: extra ['10.99.0.99']</code> report karta hai. File us getter ko <code>_mode: strict</code> maanti hai, isliye jo server kisi ne approve nahi kiya woh failure hai. 10.99.0.99 ko kisi ne approve nahi kiya, isliye woh jaayega. Chapter 7 ka tool sirf merge karta hai, isliye line hata nahi sakta; switch ka apna CLI ya review kiye hue diff ke saath replace use karo. Lab mein:</p>
<pre class="code">E1&gt; enable
E1# configure terminal
E1(config)# no ntp server 10.99.0.99
E1(config)# end
E1# write memory</pre>
<pre class="out">AUTO01$ python3 check.py
R1: PASS  failed=[] skipped=[]
J1: PASS  failed=[] skipped=['get_vlans']
E1: PASS  failed=[] skipped=[]</pre>
<p>Ab teeno PASS kehte hain, par J1 ki line dekho: <code>skipped=['get_vlans']</code>.</p>

<h3>Step 5: rule jo kabhi chala hi nahi</h3>
<p>Junos driver <code>get_vlans</code> par <code>NotImplementedError</code> uthata hai, isliye J1.yml ka woh stanza kuch nahi bachata, aur report ko jhoothi tareef deta hai. Hatao aur dobara chalao:</p>
<pre class="code">AUTO01$ sed -i '/get_vlans/d' validate/J1.yml</pre>
<pre class="out">AUTO01$ python3 check.py; echo "exit code: $?"
R1: PASS  failed=[] skipped=[]
J1: PASS  failed=[] skipped=[]
E1: PASS  failed=[] skipped=[]
<span class="hl">exit code: 0</span></pre>
<p>Teen PASS, kuch skipped nahi, exit code <code>0</code>. Chaar faults (script, file, do devices) aur ek hygiene item, aur har ek sahi taraf theek hua.</p>

<h3>Is module mein milne wale baaki errors</h3>
<table class="cmp"><tr><th>Exception</th><th>Kahan</th><th>Matlab</th></tr>
<tr><td><code>ModuleImportError</code></td><td><code>get_network_driver</code></td><td>Anjaan driver naam</td></tr>
<tr><td><code>ConnectionException</code></td><td><code>open()</code></td><td>Auth fail, host down, API off</td></tr>
<tr><td><code>MergeConfigException</code></td><td>load ya commit</td><td>Device ne candidate refuse kiya</td></tr>
<tr><td><code>ReplaceConfigException</code></td><td>load ya commit</td><td>Wahi, replace ke liye</td></tr>
<tr><td><code>CommitConfirmException</code></td><td><code>commit_config</code>, <code>confirm_commit</code></td><td>Confirm pehle se pending, ya koi nahi</td></tr>
<tr><td><code>NotImplementedError</code></td><td>getters, <code>revert_in</code></td><td>Driver yeh nahi kar sakta</td></tr>
<tr><td><code>ValidationException</code></td><td><code>compliance_report</code></td><td>Validation file missing ya valid YAML nahi</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> File ki typo ko green karne ke liye device badalna; asli drift chhupane ke liye file badalna; ek device theek karke poora job dobara na chalana; <code>skipped</code> hamesha ke liye maan lena.</p></div>

<div class="exam"><p><b>Exam trap.</b> "complies True hai par job bekaar hai." <code>skipped</code> aur file ki strictness check karo.</p></div>

<div class="scn"><h4>Har raat laal, har subah ignore</h4><p>Ek compliance job ek hafte se laal thi kyunki ek purani expectation galat thi, to team ne use padhna band kar diya. Jis hafte asli drift aaya (ek extra static route), kisi ne nahi dekha, kyunki laal normal tha. Unhone file theek ki, job ko exit 0 par laye, aur har non-zero exit par on-call ko page karwaya.</p><p><b>Lesson:</b> hamesha laal rehne wala check bina check ke barabar hai. Sahi taraf theek karke use green rakho, phir laal par alert karo.</p></div>

<div class="iv"><p class="q">"Compliance job fail ho rahi hai. Sabse pehle kya karoge?"</p><p>Main dekhta hoon ki woh chali bhi ya ValidationException jaisi exception se mar gayi. Phir failing path padhta hoon, design ya ticket se tay karta hoon ki file galat hai ya device, us taraf ko sabse chhote change se theek karta hoon, aur poora job dobara chalata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FAIL asahmati hai; design tay karta hai kaun galat hai.</li>
<li>Comparison se pehle ki exceptions script ya uske inputs ki taraf ishara karti hain.</li>
<li>Missing aur extra members device par theek hote hain; typo file mein.</li>
<li>Jo rules hamesha skip hote hain unhe hatao.</li>
<li>Sab dobara chalao aur exit code padho.</li></ul></div>`}};export{e as default};