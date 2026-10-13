var e=e=>`<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="create option">
<rect x="10" y="30" width="150" height="70" rx="10" fill="#bae6fd"/><text x="85" y="60" text-anchor="middle" class="svg-ink" font-size="13">Router: copy</text><text x="85" y="80" text-anchor="middle" class="svg-muted" font-size="11">running-config tftp:</text>
<rect x="215" y="30" width="190" height="70" rx="10" fill="#fde68a"/><text x="310" y="58" text-anchor="middle" class="svg-ink" font-size="13">File already exists?</text><text x="310" y="80" text-anchor="middle" class="svg-muted" font-size="11">or is --create set?</text>
<rect x="460" y="10" width="170" height="45" rx="8" fill="#bbf7d0"/><text x="545" y="38" text-anchor="middle" class="svg-ink" font-size="12">yes: file written</text>
<rect x="460" y="80" width="170" height="45" rx="8" fill="#fecaca"/><text x="545" y="108" text-anchor="middle" class="svg-ink" font-size="12">no: File not found</text>
<line x1="160" y1="65" x2="215" y2="65" stroke="#64748b" stroke-width="2"/><line x1="405" y1="55" x2="460" y2="33" stroke="#64748b" stroke-width="2"/><line x1="405" y1="75" x2="460" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">PUN-CORE-R1# copy running-config tftp://10.99.0.40/PUN-CORE-R1.cfg
<span class="c">(press Enter to accept the default address and file name)</span>
netadmin@tftp01:~$ sudo journalctl -u tftpd-hpa -n 2</pre>
<pre class="out"><span class="hl">%Error opening tftp://10.99.0.40/PUN-CORE-R1.cfg (No such file or directory)</span>
Sep 29 09:00:30 tftp01 in.tftpd[701]: WRQ from ::ffff:10.99.0.1 filename PUN-CORE-R1.cfg
Sep 29 09:00:30 tftp01 in.tftpd[702]: sending NAK (1, File not found) to ::ffff:10.99.0.1</pre>`,n=`<pre class="code">netadmin@tftp01:~$ sudo sed -i 's/--secure/--secure --create/' /etc/default/tftpd-hpa
netadmin@tftp01:~$ cat /etc/default/tftpd-hpa
netadmin@tftp01:~$ sudo systemctl restart tftpd-hpa</pre>
<pre class="out"># /etc/default/tftpd-hpa

TFTP_USERNAME="tftp"
TFTP_DIRECTORY="/srv/tftp"
TFTP_ADDRESS=":69"
TFTP_OPTIONS="--secure <span class="hl">--create</span>"</pre>`,r=`<pre class="code">PUN-CORE-R1# copy running-config tftp://10.99.0.40/PUN-CORE-R1.cfg
BLR-EDGE-R2# copy running-config tftp://10.99.0.40/BLR-EDGE-R2.cfg
netadmin@tftp01:~$ ls -l /srv/tftp
netadmin@tftp01:~$ sudo journalctl -u tftpd-hpa -n 2</pre>
<pre class="out">!!
<span class="hl">624 bytes copied in 0.512 secs (1219 bytes/sec)</span>
!!
624 bytes copied in 0.512 secs (1219 bytes/sec)
total 8
-rw-rw-r--  1 tftp     tftp        624 Sep 29 09:00 BLR-EDGE-R2.cfg
-rw-rw-r--  1 tftp     tftp        624 Sep 29 09:00 PUN-CORE-R1.cfg
Sep 29 09:00:30 tftp01 in.tftpd[704]: WRQ from ::ffff:10.99.0.1 filename PUN-CORE-R1.cfg
Sep 29 09:00:30 tftp01 in.tftpd[705]: WRQ from ::ffff:10.99.0.2 filename BLR-EDGE-R2.cfg</pre>`,i=`<pre class="code"><span class="c"># Reference commands (not run in the simulator): scheduled backups on IOS</span>
archive
 path tftp://10.99.0.40/$h-$t
 time-period 1440
 write-memory
<span class="c"># $h = hostname, $t = time stamp; 1440 minutes = once a day; write-memory = also on every save</span>
ip tftp source-interface Loopback0</pre>`,a={id:`router-backup`,h:{en:`Backing up a router: copy running-config tftp`,hi:`Router ka backup: copy running-config tftp`},body:{en:`
<p>Now the server is ready, you teach the routers to use it. A backup is simply one command on the router, but the first attempt usually fails in a very instructive way. Walking through that failure teaches you how TFTP servers decide what is allowed.</p>

<h3>The copy command</h3>
<p>On Cisco IOS, <code>copy SOURCE DESTINATION</code> moves files between places. A place can be <code>running-config</code> (what the router runs now, in RAM), <code>startup-config</code> (what it loads at boot, saved in flash storage), or a network location written as a URL: <code>tftp://ADDRESS/FILENAME</code>.</p>
<ul>
<li><code>copy running-config tftp://10.99.0.40/PUN-CORE-R1.cfg</code> is a <b>backup</b>: the router sends a <b>write request (WRQ)</b>.</li>
<li><code>copy tftp://10.99.0.40/PUN-CORE-R1.cfg running-config</code> is a <b>restore</b>: the router sends a <b>read request (RRQ)</b>. You will do it in chapter 6.</li>
</ul>
<p>When you type the short form, IOS asks you to confirm the remote host address and the destination file name. Press Enter to accept the values in square brackets. If you type the full URL you only press Enter at the confirmations. Run the command in privileged mode (<code>enable</code> first).</p>

<h3>The first attempt fails: why?</h3>
`+t+`
<p>Read both sides, router and server. The router says <code>No such file or directory</code>. The server's journal shows the request arrived (<code>WRQ from ... filename PUN-CORE-R1.cfg</code>) and the server answered with an error packet: <b>NAK (1, File not found)</b>. So the network, the firewall and the daemon are fine. The server refused because of its <b>default rule</b>: tftpd-hpa lets a client overwrite a file that already exists, but it does <b>not create new files</b> unless it is told to. A brand-new router has no file on the server yet, so its first upload fails.</p>
`+e(`Without the create option the server only overwrites files that already exist.`)+`

<h3>The fix: allow creation of new files</h3>
<p>Add the <code>--create</code> flag to the options and restart. The command <code>sed -i 's/OLD/NEW/' FILE</code> edits a file in place, replacing the first match on each line. You could also open the file in an editor.</p>
`+n+`
<p>This is a trade-off that you should be able to explain. <code>--create</code> makes the server more convenient (new devices need no preparation) and slightly less safe (a client can now add files to the folder). On an isolated management network with a firewall that admits only your devices, most teams accept it. If you prefer stricter control, you can instead create an empty file for each device in advance, with the right owner, and leave <code>--create</code> off.</p>

<h3>Second attempt: success</h3>
`+r+`
<p>The router prints <code>!</code> for each acknowledged block group and ends with the byte count. On the server <code>ls -l</code> shows two new files owned by <code>tftp</code> with mode <code>-rw-rw-r--</code>, and the journal records two write requests from the two routers' addresses. The size, 624 bytes, matches what the router reported. Check this number each time: a backup of 0 bytes is worse than no backup, because it looks like success.</p>

<h3>Naming and automation</h3>
<p>Choose file names that you can sort and search: device name, then date, for example <code>PUN-CORE-R1-2026-09-29.cfg</code>. A fixed name like <code>PUN-CORE-R1.cfg</code> is overwritten each time and keeps only the latest version. Many teams keep both: a fixed name for "current" and dated copies for history. IOS can schedule backups itself with the archive feature:</p>
`+i+`

<div class="eg"><p><b>Worked example.</b> Deccan Net adds a third router, MUM-DIST-R3. Because <code>--create</code> is on, the engineer only runs one command on the router: <code>copy running-config tftp://10.99.0.40/MUM-DIST-R3.cfg</code>. A new file appears on the server. He verifies with <code>ls -l /srv/tftp</code>, sees a non-zero size, and adds the device to the nightly job. Total time: one minute, no change on the server.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Reading <code>No such file or directory</code> as a network problem, when the NAK in the journal proves the server was reached; forgetting to run <code>enable</code>; typing a different file name on the router than the one you search for on the server. Names are case sensitive on Linux.</p></div>
<div class="exam"><p><b>Exam trap.</b> The error text on the router is generic. The server's journal gives the exact reason. A NAK with code 1 is "file not found", with code 0 and text it is a general error such as "Permission denied".</p></div>

<div class="scn"><h4>The router that could not upload</h4><p>A new branch router failed with "No such file or directory" on every backup attempt. The engineer first suspected the firewall and spent an hour with packet captures. A look at the journal showed <code>WRQ</code> followed by <code>File not found</code>: the request had arrived. The server simply lacked <code>--create</code>.</p><p><b>Lesson:</b> check the server journal first. Evidence that the request arrived rules out the whole network path.</p></div>

<div class="iv"><p class="q">"A router cannot back up to the TFTP server and says no such file or directory. What is going on?"</p><p>The request probably reached the server, which replied with a file-not-found NAK because tftpd-hpa does not create files by default. Confirm in <code>journalctl -u tftpd-hpa</code>, then add <code>--create</code> to TFTP_OPTIONS and restart, or pre-create the target file with the right owner and permissions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Backup is <code>copy running-config tftp://SERVER/NAME</code>, a TFTP write request.</li>
<li>tftpd-hpa only overwrites existing files unless <code>--create</code> is set.</li>
<li>The server journal shows WRQ and the NAK reason; use it before suspecting the network.</li>
<li>Verify with <code>ls -l</code>: the file exists and its size is not zero.</li>
<li>Name files by device and date, and keep history.</li>
</ul></div>
`,hi:`
<p>Ab server ready hai, aap routers ko use karna sikhate ho. Backup router par bas ek command hai, par pehli koshish aksar bahut sikhane wale tareeke se fail hoti hai. Us failure ko samajhne se pata chalta hai ki TFTP servers kaise tay karte hain ki kya allowed hai.</p>

<h3>Copy command</h3>
<p>Cisco IOS par <code>copy SOURCE DESTINATION</code> jagahon ke beech files move karta hai. Jagah ho sakti hai <code>running-config</code> (jo router abhi chala raha hai, RAM mein), <code>startup-config</code> (jo woh boot par load karta hai, flash storage mein saved), ya network location jo URL ki tarah likhi jaati hai: <code>tftp://ADDRESS/FILENAME</code>.</p>
<ul>
<li><code>copy running-config tftp://10.99.0.40/PUN-CORE-R1.cfg</code> ek <b>backup</b> hai: router <b>write request (WRQ)</b> bhejta hai.</li>
<li><code>copy tftp://10.99.0.40/PUN-CORE-R1.cfg running-config</code> ek <b>restore</b> hai: router <b>read request (RRQ)</b> bhejta hai. Yeh aap chapter 6 mein karoge.</li>
</ul>
<p>Short form type karne par IOS remote host address aur destination file naam confirm karne ko kehta hai. Square brackets ki values accept karne ke liye Enter dabao. Poora URL type karo to sirf confirmations par Enter dabate ho. Command privileged mode mein chalao (pehle <code>enable</code>).</p>

<h3>Pehli koshish fail hoti hai: kyun?</h3>
`+t+`
<p>Dono taraf padho, router aur server. Router kehta hai <code>No such file or directory</code>. Server ka journal dikhata hai ki request pahunchi (<code>WRQ from ... filename PUN-CORE-R1.cfg</code>) aur server ne error packet se jawab diya: <b>NAK (1, File not found)</b>. Yaani network, firewall aur daemon theek hain. Server ne apne <b>default rule</b> ki wajah se mana kiya: tftpd-hpa client ko pehle se maujood file overwrite karne deta hai, par jab tak kaha na jaaye woh <b>nayi files nahi banata</b>. Bilkul naye router ki server par abhi koi file nahi hai, isliye uska pehla upload fail hota hai.</p>
`+e(`Create option ke bina server sirf pehle se maujood files overwrite karta hai.`)+`

<h3>Fix: nayi files banane do</h3>
<p>Options mein <code>--create</code> flag jodo aur restart karo. Command <code>sed -i 's/OLD/NEW/' FILE</code> file ko wahin edit karta hai, har line ka pehla match badalta hai. Aap file ko editor mein bhi khol sakte ho.</p>
`+n+`
<p>Yeh ek trade-off hai jo aapko samjhana aana chahiye. <code>--create</code> server ko zyada convenient banata hai (naye devices ko taiyari nahi chahiye) aur thoda kam surakshit (client ab folder mein files jod sakta hai). Sirf aapke devices ko admit karne wale firewall ke saath isolated management network par zyadatar teams ise maan leti hain. Zyada sakht control chahiye to har device ke liye pehle se sahi owner ke saath khali file bana do aur <code>--create</code> band rakho.</p>

<h3>Doosri koshish: success</h3>
`+r+`
<p>Router har acknowledged block group ke liye <code>!</code> print karta hai aur byte count par khatam hota hai. Server par <code>ls -l</code> do nayi files dikhata hai jo <code>tftp</code> ki hain aur mode <code>-rw-rw-r--</code> hai, aur journal dono routers ke addresses se do write requests record karta hai. Size, 624 bytes, router ke bataye se match karta hai. Har baar yeh number check karo: 0 bytes ka backup bina backup se bura hai, kyunki woh success jaisa dikhta hai.</p>

<h3>Naming aur automation</h3>
<p>Aise file naam chuno jo sort aur search ho saken: device naam, phir date, jaise <code>PUN-CORE-R1-2026-09-29.cfg</code>. <code>PUN-CORE-R1.cfg</code> jaisa fixed naam har baar overwrite hota hai aur sirf latest version rakhta hai. Bahut si teams dono rakhti hain: "current" ke liye fixed naam aur history ke liye dated copies. IOS archive feature se backups khud schedule kar sakta hai:</p>
`+i+`

<div class="eg"><p><b>Worked example.</b> Deccan Net teesra router, MUM-DIST-R3, jodta hai. Kyunki <code>--create</code> on hai, engineer router par sirf ek command chalata hai: <code>copy running-config tftp://10.99.0.40/MUM-DIST-R3.cfg</code>. Server par nayi file aa jaati hai. Woh <code>ls -l /srv/tftp</code> se verify karta hai, non-zero size dekhta hai, aur device ko nightly job mein jodta hai. Kul time: ek minute, server par koi change nahi.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> <code>No such file or directory</code> ko network problem padhna, jabki journal ka NAK sabit karta hai ki server tak pahunche; <code>enable</code> chalana bhool jaana; router par alag file naam type karna aur server par alag search karna. Linux par naam case sensitive hote hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Router par error text generic hota hai. Server ka journal exact wajah deta hai. Code 1 ka NAK "file not found" hai, code 0 text ke saath "Permission denied" jaisa general error hai.</p></div>

<div class="scn"><h4>Router jo upload nahi kar paya</h4><p>Ek naya branch router har backup attempt par "No such file or directory" se fail hua. Engineer ne pehle firewall par shak kiya aur ek ghanta packet captures mein lagaya. Journal dekhne par <code>WRQ</code> ke baad <code>File not found</code> dikha: request pahunchi thi. Server mein bas <code>--create</code> nahi tha.</p><p><b>Lesson:</b> pehle server journal check karo. Request pahunchne ka saboot poore network path ko rule out kar deta hai.</p></div>

<div class="iv"><p class="q">"Router TFTP server par backup nahi le pa raha aur no such file or directory kehta hai. Kya ho raha hai?"</p><p>Request shayad server tak pahunch gayi, jisne file-not-found NAK se jawab diya kyunki tftpd-hpa default mein files nahi banata. <code>journalctl -u tftpd-hpa</code> mein confirm karo, phir TFTP_OPTIONS mein <code>--create</code> jodo aur restart karo, ya target file ko sahi owner aur permissions ke saath pehle se bana do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Backup <code>copy running-config tftp://SERVER/NAME</code> hai, ek TFTP write request.</li>
<li>tftpd-hpa sirf maujood files overwrite karta hai jab tak <code>--create</code> set na ho.</li>
<li>Server journal WRQ aur NAK ki wajah dikhata hai; network par shak se pehle use dekho.</li>
<li><code>ls -l</code> se verify karo: file hai aur size zero nahi hai.</li>
<li>Files ko device aur date se naam do, aur history rakho.</li>
</ul></div>
`}};export{a as default};