var e=e=>`<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Merge versus replace">
<rect x="10" y="20" width="190" height="110" rx="10" fill="#fde68a"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Running config now</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="11">hostname Router</text><text x="105" y="86" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 10.99.0.2</text><text x="105" y="104" text-anchor="middle" class="svg-muted" font-size="11">(WAN missing)</text>
<rect x="230" y="40" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="315" y="68" text-anchor="middle" class="svg-ink" font-size="13">copy tftp: running</text><text x="315" y="88" text-anchor="middle" class="svg-muted" font-size="11">merge, line by line</text>
<rect x="430" y="20" width="200" height="110" rx="10" fill="#bbf7d0"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">Running config after</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="11">hostname BLR-EDGE-R2</text><text x="530" y="86" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1 172.16.20.2</text><text x="530" y="104" text-anchor="middle" class="svg-muted" font-size="11">ip route 0.0.0.0 ...</text>
<line x1="200" y1="75" x2="230" y2="75" stroke="#64748b" stroke-width="2"/><line x1="400" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">PUN-CORE-R1# configure terminal
PUN-CORE-R1(config)# ntp server 10.99.0.40
PUN-CORE-R1(config)# end
PUN-CORE-R1# copy running-config tftp://10.99.0.40/PUN-CORE-R1-after.cfg
netadmin@tftp01:~$ diff /srv/tftp/PUN-CORE-R1.cfg /srv/tftp/PUN-CORE-R1-after.cfg</pre>
<pre class="out">!!
648 bytes copied in 0.512 secs (1266 bytes/sec)
<span class="hl">35a36,37</span>
&gt; ntp server 10.99.0.40
&gt; !</pre>`,n=`<pre class="code">netadmin@tftp01:~$ diff -u /srv/tftp/PUN-CORE-R1.cfg /srv/tftp/PUN-CORE-R1-after.cfg</pre>
<pre class="out">--- /srv/tftp/PUN-CORE-R1.cfg
+++ /srv/tftp/PUN-CORE-R1-after.cfg
@@ -1,43 +1,45 @@
 ...  (unchanged lines left out here)
<span class="hl">+ntp server 10.99.0.40
+!</span>
 control-plane
 ...</pre>`,r=`<pre class="code">BLR-EDGE-R2# copy tftp://10.99.0.40/BLR-EDGE-R2.cfg running-config
BLR-EDGE-R2# show running-config | include hostname|ip route</pre>
<pre class="out">Accessing tftp://10.99.0.40/BLR-EDGE-R2.cfg...
Loading BLR-EDGE-R2.cfg from 10.99.0.40 (via GigabitEthernet0/0): !
<span class="hl">[OK - 509 bytes]</span>

509 bytes copied in 0.061 secs (8344 bytes/sec)
hostname BLR-EDGE-R2
ip route 0.0.0.0 0.0.0.0 172.16.20.1</pre>`,i=`<pre class="code">BLR-EDGE-R2# show ip interface brief
BLR-EDGE-R2# copy running-config startup-config
BLR-EDGE-R2# show startup-config | include hostname</pre>
<pre class="out">Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.2       YES manual up                    up
GigabitEthernet0/1     <span class="hl">172.16.20.2</span>     YES manual down                  down
GigabitEthernet0/2     unassigned      YES unset  administratively down down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Building configuration...
[OK]
hostname BLR-EDGE-R2</pre>`,a=`<pre class="code"><span class="c"># Reference commands (not run in the simulator): full replacement instead of merge</span>
configure replace tftp://10.99.0.40/BLR-EDGE-R2.cfg list
configure replace tftp://10.99.0.40/BLR-EDGE-R2.cfg force</pre>`,o={id:`compare-restore`,h:{en:`Comparing backups with diff and restoring a router`,hi:`diff se backups compare karna aur router restore karna`},body:{en:`
<p>A backup has two jobs. The first is <b>recovery</b>: rebuild a device after a disaster. The second, which you will use far more often, is <b>comparison</b>: answer the question every ticket starts with, "what changed?" This chapter covers both.</p>

<h3>Job 1: comparing two backups with diff</h3>
<p>The command <code>diff FILE1 FILE2</code> prints only the differences between two text files. In the lab, you take a backup of PUN-CORE-R1, add one line (an NTP server) and take a second backup. Now compare:</p>
`+t+`
<p>How to read a diff:</p>
<ul>
<li><code>35a36,37</code> is a coordinate: after line 35 of the first file, lines 36 to 37 of the second file were <b>a</b>dded. The letter <b>c</b> means <i>changed</i> and <b>d</b> means <i>deleted</i>.</li>
<li>Lines that start with <code>&gt;</code> exist only in the second file. Lines that start with <code>&lt;</code> exist only in the first.</li>
<li>If the two files are identical, <code>diff</code> prints nothing at all. That is the best answer to "did anything change?"</li>
</ul>
<p>The flag <code>-u</code> gives the <b>unified</b> format, which is what Git uses and what review tools show: removed lines begin with <code>-</code>, added lines with <code>+</code>.</p>
`+n+`
<p>In this simulator the unified output prints the whole file as one block; a real <code>diff -u</code> shows only three lines of context around each change. Either way, the lines you care about are the ones marked <code>+</code>. This tiny example already shows the value: in a real network a diff between yesterday and today finds the one added ACL line, the shut interface or the changed OSPF cost that explains the incident. Some tools also hide changing noise such as the "Last configuration change" comment; learn which lines in your device's output change by themselves.</p>

<h3>Job 2: restoring a router</h3>
<p>Back to the P1 ticket. BLR-EDGE-R2 was erased and reloaded. It has the name <code>Router</code> and only its management address. Once the permissions problem from chapter 5 is fixed, restoring is one command, the mirror image of the backup:</p>
`+r+`
<p>The router sends an RRQ, the server returns 509 bytes, and the file is applied line by line. The two lines you checked show the hostname and the default route are back. Notice the important word in the output: the file was loaded into <code>running-config</code>, so it is now active in RAM.</p>
`+e(`A restore to running-config is a merge: each line of the file is applied as if you typed it.`)+`

<h3>Merge, not replace</h3>
<p>This is the single most misunderstood point. <code>copy tftp: running-config</code> does <b>not</b> wipe the router and load the file. It <b>merges</b>: each line is applied exactly as if you pasted it into <code>configure terminal</code>. Lines in the file are added or changed. Commands that are already on the router but absent from the file <b>stay</b>. For rebuilding a wiped router this is ideal, because there is nothing to conflict. For rolling back a bad change on a router that still has extra configuration, merge will not remove the extras. For an exact copy, IOS offers a different tool:</p>
`+a+`
<p><code>configure replace</code> computes the difference and applies the commands needed to make the running configuration identical to the file. It is powerful, so try <code>list</code> first (it shows what would change) and only then <code>force</code>.</p>

<h3>Verify, then save</h3>
<p>A restore is not finished when the command returns. Verify the addresses and routes, then save so that the router keeps them after the next reload:</p>
`+i+`
<p>Gi0/1 shows the restored WAN address 172.16.20.2. It is <code>down down</code> in the lab because nothing is cabled to the ISP, which is normal here. On a real branch you would also check that the link comes up and the routing neighbours return. <code>copy running-config startup-config</code> saved the configuration (<code>[OK]</code>), and the last command confirms the startup file now carries the right hostname. Skipping this step is a classic mistake: the router works until the next power cut, then returns to "Router".</p>

<div class="eg"><p><b>Worked example.</b> Timeline of the P1: 23:50 router erased. 23:52 an engineer reaches the console and sets the management address. 23:55 the first restore fails with Permission denied. 23:58 <code>chmod 644</code> on the backup. 00:00 restore succeeds, hostname and WAN route return. 00:02 <code>show ip interface brief</code> checks addresses. 00:03 <code>copy running-config startup-config</code>. 00:05 ISP link up and OSPF neighbour back. Ten minutes of fixing, thanks to a nightly backup.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Restoring and forgetting to save; assuming a restore removes old commands; restoring an old file over a newer configuration and losing recent changes. Always keep the latest backup before you restore, and compare first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Copying a file to <code>running-config</code> merges; copying a file to <code>startup-config</code> replaces the startup file. Know that difference, and that <code>configure replace</code> is the way to make running match a file exactly.</p></div>

<div class="scn"><h4>The ACL line nobody remembered</h4><p>Users at a branch lost access to a payroll server on Monday. The team compared Sunday's and Monday's backups of the branch router: <code>diff</code> printed two lines, a new <code>deny</code> entry added on Sunday by a maintenance script. Removing it fixed the problem in a minute. Without dated backups the search would have taken hours.</p><p><b>Lesson:</b> keep dated backups and make <code>diff</code> your first troubleshooting command.</p></div>

<div class="iv"><p class="q">"What is the difference between copy tftp running-config and configure replace?"</p><p><code>copy tftp: running-config</code> merges the file line by line into the active configuration, so existing commands that are not in the file remain. <code>configure replace</code> makes the running configuration exactly equal to the file by adding and removing commands. Use merge to rebuild an empty router and replace for a clean rollback. Always save with <code>copy running-config startup-config</code> afterwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>diff</code> prints only differences; <code>&gt;</code> lines are only in the second file; no output means identical.</li>
<li><code>diff -u</code> gives the +/- format familiar from Git.</li>
<li>A restore is the same copy command in the other direction, an RRQ.</li>
<li>Copying to running-config is a merge; <code>configure replace</code> makes it an exact copy.</li>
<li>Verify addresses and routes, then <code>copy running-config startup-config</code>.</li>
</ul></div>
`,hi:`
<p>Backup ke do kaam hain. Pehla hai <b>recovery</b>: disaster ke baad device ko rebuild karna. Doosra, jo aap kahin zyada baar use karoge, <b>comparison</b> hai: har ticket ke shuru ka sawaal, "kya badla?" ka jawab dena. Yeh chapter dono cover karta hai.</p>

<h3>Kaam 1: diff se do backups compare karna</h3>
<p>Command <code>diff FILE1 FILE2</code> do text files ke beech sirf farak print karta hai. Lab mein aap PUN-CORE-R1 ka backup lete ho, ek line (NTP server) jodte ho aur doosra backup lete ho. Ab compare karo:</p>
`+t+`
<p>Diff kaise padhte hain:</p>
<ul>
<li><code>35a36,37</code> ek coordinate hai: pehli file ki line 35 ke baad, doosri file ki lines 36 se 37 <b>a</b>dd hui. Akshar <b>c</b> ka matlab <i>changed</i> aur <b>d</b> ka matlab <i>deleted</i> hai.</li>
<li><code>&gt;</code> se shuru lines sirf doosri file mein hain. <code>&lt;</code> se shuru lines sirf pehli mein hain.</li>
<li>Agar dono files identical hain, to <code>diff</code> kuch print nahi karta. "Kya kuch badla?" ka yahi sabse achha jawab hai.</li>
</ul>
<p>Flag <code>-u</code> <b>unified</b> format deta hai, jo Git use karta hai aur review tools dikhate hain: hataayi gayi lines <code>-</code> se, jodi gayi lines <code>+</code> se shuru hoti hain.</p>
`+n+`
<p>Is simulator mein unified output poori file ko ek block ki tarah print karta hai; asli <code>diff -u</code> har change ke aas-paas sirf teen lines ka context dikhata hai. Dono tareeke se, aapko <code>+</code> se marked lines chahiye. Yeh chhota example bhi value dikhata hai: asli network mein kal aur aaj ke beech ka diff woh ek jodi hui ACL line, shut interface ya badli hui OSPF cost dhoondh deta hai jo incident samjhati hai. Kuch tools "Last configuration change" jaise comment ka shor bhi chhupa dete hain; seekho ki aapke device ke output mein kaunsi lines apne aap badalti hain.</p>

<h3>Kaam 2: router restore karna</h3>
<p>P1 ticket par wapas. BLR-EDGE-R2 erase aur reload hua tha. Uska naam <code>Router</code> hai aur sirf management address hai. Chapter 5 ki permissions problem theek hone ke baad restore ek command hai, backup ki mirror image:</p>
`+r+`
<p>Router RRQ bhejta hai, server 509 bytes lautata hai, aur file line by line apply hoti hai. Jo do lines aapne check ki woh dikhati hain ki hostname aur default route wapas hain. Output ka zaroori shabd dhyan se dekho: file <code>running-config</code> mein load hui, yaani ab woh RAM mein active hai.</p>
`+e(`running-config mein restore ek merge hai: file ki har line waise apply hoti hai jaise aapne type ki ho.`)+`

<h3>Merge, replace nahi</h3>
<p>Yeh sabse zyada galat samjha jaane wala point hai. <code>copy tftp: running-config</code> router ko saaf karke file load <b>nahi</b> karta. Woh <b>merge</b> karta hai: har line bilkul waise apply hoti hai jaise aapne use <code>configure terminal</code> mein paste kiya ho. File ki lines add ya change hoti hain. Jo commands router par pehle se hain par file mein nahi, woh <b>rehte</b> hain. Mite hue router ko rebuild karne ke liye yeh ideal hai, kyunki conflict karne ko kuch nahi. Aise router par bad change roll back karne ke liye jisme extra configuration hai, merge extras ko nahi hataayega. Exact copy ke liye IOS alag tool deta hai:</p>
`+a+`
<p><code>configure replace</code> farak nikaalta hai aur woh commands apply karta hai jo running configuration ko file ke bilkul barabar banaye. Yeh powerful hai, isliye pehle <code>list</code> try karo (dikhata hai kya badlega) aur tab hi <code>force</code>.</p>

<h3>Verify karo, phir save karo</h3>
<p>Command lautne par restore poora nahi hota. Addresses aur routes verify karo, phir save karo taaki router agle reload ke baad bhi unhe rakhe:</p>
`+i+`
<p>Gi0/1 restore kiya hua WAN address 172.16.20.2 dikhata hai. Lab mein woh <code>down down</code> hai kyunki ISP ki taraf kuch cable nahi hai, jo yahan normal hai. Asli branch par aap yeh bhi check karoge ki link up aaye aur routing neighbours wapas aayein. <code>copy running-config startup-config</code> ne configuration save ki (<code>[OK]</code>), aur aakhri command confirm karta hai ki startup file mein ab sahi hostname hai. Yeh step chhodna classic galti hai: router agli power cut tak chalta hai, phir "Router" par laut jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> P1 ki timeline. 23:50 router erase hua. 23:52 engineer console tak pahunchta hai aur management address set karta hai. 23:55 pehla restore Permission denied se fail. 23:58 backup par <code>chmod 644</code>. 00:00 restore succeed, hostname aur WAN route wapas. 00:02 <code>show ip interface brief</code> addresses check karta hai. 00:03 <code>copy running-config startup-config</code>. 00:05 ISP link up aur OSPF neighbour wapas. Nightly backup ki badaulat das minute ki fixing.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Restore karke save bhool jaana; maan lena ki restore purane commands hata deta hai; purani file ko nayi configuration par restore karke recent changes kho dena. Restore se pehle hamesha latest backup rakho aur pehle compare karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> File ko <code>running-config</code> mein copy karna merge karta hai; file ko <code>startup-config</code> mein copy karna startup file ko replace karta hai. Yeh farak jaano, aur yeh bhi ki <code>configure replace</code> running ko file ke bilkul match karne ka tareeka hai.</p></div>

<div class="scn"><h4>Woh ACL line jo kisi ko yaad nahi thi</h4><p>Monday ko branch ke users ka payroll server access chala gaya. Team ne branch router ke Sunday aur Monday ke backups compare kiye: <code>diff</code> ne do lines print ki, ek naya <code>deny</code> entry jo Sunday ko maintenance script ne jodi thi. Use hatane se ek minute mein problem theek hui. Dated backups ke bina khoj mein ghante lagte.</p><p><b>Lesson:</b> dated backups rakho aur <code>diff</code> ko apna pehla troubleshooting command banao.</p></div>

<div class="iv"><p class="q">"copy tftp running-config aur configure replace mein kya difference hai?"</p><p><code>copy tftp: running-config</code> file ko active configuration mein line by line merge karta hai, isliye file mein na hone wale maujooda commands rehte hain. <code>configure replace</code> commands add aur remove karke running configuration ko file ke bilkul barabar banata hai. Khali router rebuild karne ke liye merge aur clean rollback ke liye replace use karo. Baad mein hamesha <code>copy running-config startup-config</code> se save karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>diff</code> sirf farak print karta hai; <code>&gt;</code> lines sirf doosri file mein hain; koi output nahi matlab identical.</li>
<li><code>diff -u</code> Git se jaana-pehchana +/- format deta hai.</li>
<li>Restore doosri disha mein wahi copy command hai, ek RRQ.</li>
<li>running-config mein copy merge hai; <code>configure replace</code> use exact copy banata hai.</li>
<li>Addresses aur routes verify karo, phir <code>copy running-config startup-config</code>.</li>
</ul></div>
`}};export{o as default};