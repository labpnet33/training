var e={id:`troubleshooting`,h:{en:`Troubleshooting with text tools: the flap and the attack`,hi:`Text tools se troubleshooting: flap aur attack`},body:{en:`
<p><b>The idea of this chapter:</b> every investigation follows the same loop: <b>look, narrow, count, save</b>. You will walk through both labs of this module with real commands. The tools are from earlier chapters, only the order is new.</p>

<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Investigation loop">
<rect x="10" y="30" width="130" height="50" rx="10" fill="#bae6fd"/><text x="75" y="60" text-anchor="middle" class="svg-ink" font-size="13">1 Look (head, wc)</text>
<rect x="170" y="30" width="140" height="50" rx="10" fill="#bbf7d0"/><text x="240" y="60" text-anchor="middle" class="svg-ink" font-size="13">2 Narrow (grep)</text>
<rect x="340" y="30" width="140" height="50" rx="10" fill="#fde68a"/><text x="410" y="60" text-anchor="middle" class="svg-ink" font-size="13">3 Count (sort, uniq)</text>
<rect x="510" y="30" width="120" height="50" rx="10" fill="#e9d5ff"/><text x="570" y="60" text-anchor="middle" class="svg-ink" font-size="13">4 Save (&gt;)</text>
<line x1="140" y1="55" x2="170" y2="55" stroke="#64748b" stroke-width="2"/><line x1="310" y1="55" x2="340" y2="55" stroke="#64748b" stroke-width="2"/><line x1="480" y1="55" x2="510" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Look, narrow, count, save.</p></div>

<h3>Lab 1: the flapping link on NMS01</h3>
<p><b>Ticket:</b> users in Bengaluru complain that the network "drops every few minutes". The syslog server NMS01 collects router logs in <code>/var/log/remote/routers.log</code>.</p>
<p><b>Look.</b> How big is the file, and which devices talk?</p>
<pre class="out">netadmin@nms01:~$ wc -l /var/log/remote/routers.log
30 /var/log/remote/routers.log
netadmin@nms01:~$ awk '{print $4}' /var/log/remote/routers.log | sort | uniq -c
      4 10.10.0.1
     17 10.20.0.1
      7 10.40.3.1
      2 10.50.0.1</pre>
<p>Router 10.20.0.1 (BLR-EDGE-R2, in <code>devices.csv</code>) is chatty: 17 of 30 lines. <b>Narrow</b> to down events and <b>count</b> per interface:</p>
<pre class="out">netadmin@nms01:~$ grep -c "state to down" /var/log/remote/routers.log
12
netadmin@nms01:~$ grep "state to down" /var/log/remote/routers.log | grep -o "Interface [A-Za-z0-9/]*" | sort | uniq -c | sort -rn
      7 Interface GigabitEthernet0/2
      2 Interface GigabitEthernet0/1
      2 Interface GigabitEthernet0/0
      1 Interface GigabitEthernet0/3</pre>
<p>Twelve down events, and Gi0/2 accounts for seven. Check the <b>timing</b>, because a flap shows a repeating pattern:</p>
<pre class="code">grep "GigabitEthernet0/2" /var/log/remote/routers.log | head -n 4</pre>
<p>The earlier chapters showed the answer: down at 06:06:08, up nine seconds later at 06:06:17, and again every few minutes until 06:52. A link that drops for nine seconds at regular intervals points at a physical cause such as a bad cable, a dirty fibre or a failing SFP, not at routing. <b>Save</b> the evidence with the report from chapter 5: the top-talker output in <code>reports/flaps.txt</code> and the note "Action: check cabling on BLR-EDGE-R2 Gi0/2".</p>

<h3>Lab 2: who is attacking the jump host?</h3>
<p><b>Ticket NK-SEC-88:</b> "lots of SSH login failures on JUMP01 overnight". First, can you even read the log?</p>
<pre class="out">netadmin@jump01:~$ ls -l /var/log/auth.log
-rw-r-----  1 syslog   adm        2856 Sep 29 09:00 /var/log/auth.log
netadmin@jump01:~$ id
uid=1001(netadmin) gid=1001(netadmin) groups=1001(netadmin),4(adm),27(sudo)</pre>
<p>The mode <code>rw-r-----</code> means only the owner and the <code>adm</code> group can read it. You are in <code>adm</code>, so no <code>sudo</code> is needed (permissions are covered in the next module). <b>Count</b> first:</p>
<pre class="out">netadmin@jump01:~$ grep -c "Failed password" /var/log/auth.log
19
netadmin@jump01:~$ grep "Failed password" /var/log/auth.log | grep -oE "from [0-9.]+" | sort | uniq -c | sort -rn
     13 from 203.0.113.45
      3 from 198.51.100.7
      2 from 192.0.2.99
      1 from 10.99.0.51</pre>
<p>Nineteen failures, 13 from one address (203.0.113.45 is a documentation address standing in for the attacker). Which usernames were guessed?</p>
<pre class="out">netadmin@jump01:~$ grep -o "invalid user [a-z]*" /var/log/auth.log | awk '{print $3}' | sort -u
admin
cisco
guest
oracle
pi
test
ubnt</pre>
<p>Seven default usernames that attackers always try. None of them exist on our server. The most important question: <b>did anyone get in?</b></p>
<pre class="out">netadmin@jump01:~$ grep Accepted /var/log/auth.log
Sep 29 02:00:23 jump01 sshd[2101]: Accepted publickey for netadmin from 10.99.0.50 port 52101 ssh2
Sep 29 02:02:29 jump01 sshd[2116]: Accepted password for priya from 10.99.0.51 port 52116 ssh2</pre>
<p>Two successful logins, both from the internal 10.99.0.x management network: the engineer netadmin and priya. No success from the outside addresses. One of the failures from 10.99.0.51 was most likely priya mistyping her password before she got it right; worth a quick check, not an alarm. Now <b>save</b> the list for the firewall team, leaving out internal addresses:</p>
<pre class="out">netadmin@jump01:~$ grep "Failed password" /var/log/auth.log | grep -oE "from [0-9.]+" | awk '{print $2}' | grep -v "^10\\.99\\." | sort -u &gt; blocklist.txt
netadmin@jump01:~$ cat blocklist.txt
192.0.2.99
198.51.100.7
203.0.113.45</pre>
<p><code>grep -v</code> removes lines that match. The pattern <code>^10\\.99\\.</code> means "starts with 10.99." (the backslash makes the dot literal). Always review the list before sending it: a blocklist that contains your own management network cuts your own access.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Blocking every address in the log without checking for your own. (2) Concluding "attack" or "safe" from one command; confirm with <code>grep Accepted</code>. (3) Reading the whole log by eye instead of counting. (4) Trying <code>sudo</code> for a file your group can already read; use the least privilege that works.</p></div>
<div class="exam"><p><b>Exam trap.</b> Failed logins show <code>Failed password</code>; successful ones show <code>Accepted</code>. The investigation answers are counts and addresses, not raw log lines.</p></div>

<div class="scn"><h4>Quiet success</h4><p>A night-shift engineer saw hundreds of SSH failures and wanted to shut the jump host. Before doing that, a senior ran two commands: the failure count per source and <code>grep Accepted</code>. All logins from outside had failed, so only the blocklist was sent to the firewall team and the host stayed up.</p><p><b>Lesson:</b> count, then check for success, then act.</p></div>

<div class="iv"><p class="q">"Walk me through investigating many SSH login failures."</p><p>I count failed logins per source address with <code>grep</code>, <code>sort</code> and <code>uniq -c</code>, list the usernames tried, then check <code>Accepted</code> lines to see if anyone got in from an untrusted address. I extract the addresses, remove my internal range, write them to a file with <code>&gt;</code>, and review before handing it to the firewall team.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loop: look, narrow, count, save.</li>
<li>Timing and counts tell the cause: regular short drops mean a physical problem.</li>
<li>Always check success lines (<code>Accepted</code>) before calling something an attack.</li>
<li>Review any generated blocklist before it reaches a firewall.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> har investigation ek hi loop follow karti hai: <b>dekho, chhaanto, ginti karo, save karo</b>. Aap is module ki dono labs real commands ke saath chalaoge. Tools pichhle chapters ke hain, sirf order naya hai.</p>

<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Investigation loop">
<rect x="10" y="30" width="130" height="50" rx="10" fill="#bae6fd"/><text x="75" y="60" text-anchor="middle" class="svg-ink" font-size="13">1 Dekho (head, wc)</text>
<rect x="170" y="30" width="140" height="50" rx="10" fill="#bbf7d0"/><text x="240" y="60" text-anchor="middle" class="svg-ink" font-size="13">2 Chhaanto (grep)</text>
<rect x="340" y="30" width="140" height="50" rx="10" fill="#fde68a"/><text x="410" y="60" text-anchor="middle" class="svg-ink" font-size="13">3 Ginti (sort, uniq)</text>
<rect x="510" y="30" width="120" height="50" rx="10" fill="#e9d5ff"/><text x="570" y="60" text-anchor="middle" class="svg-ink" font-size="13">4 Save (&gt;)</text>
<line x1="140" y1="55" x2="170" y2="55" stroke="#64748b" stroke-width="2"/><line x1="310" y1="55" x2="340" y2="55" stroke="#64748b" stroke-width="2"/><line x1="480" y1="55" x2="510" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Dekho, chhaanto, ginti, save.</p></div>

<h3>Lab 1: NMS01 par flapping link</h3>
<p><b>Ticket:</b> Bengaluru ke users shikayat karte hain ki network "har kuch minute mein gir jaata hai". Syslog server NMS01 router logs <code>/var/log/remote/routers.log</code> mein jama karta hai.</p>
<p><b>Dekho.</b> File kitni badi hai, aur kaun se devices bol rahe hain?</p>
<pre class="out">netadmin@nms01:~$ wc -l /var/log/remote/routers.log
30 /var/log/remote/routers.log
netadmin@nms01:~$ awk '{print $4}' /var/log/remote/routers.log | sort | uniq -c
      4 10.10.0.1
     17 10.20.0.1
      7 10.40.3.1
      2 10.50.0.1</pre>
<p>Router 10.20.0.1 (BLR-EDGE-R2, <code>devices.csv</code> mein) bahut bol raha hai: 30 mein se 17 lines. Down events tak <b>chhaanto</b> aur interface ke hisaab se <b>ginti</b> karo:</p>
<pre class="out">netadmin@nms01:~$ grep -c "state to down" /var/log/remote/routers.log
12
netadmin@nms01:~$ grep "state to down" /var/log/remote/routers.log | grep -o "Interface [A-Za-z0-9/]*" | sort | uniq -c | sort -rn
      7 Interface GigabitEthernet0/2
      2 Interface GigabitEthernet0/1
      2 Interface GigabitEthernet0/0
      1 Interface GigabitEthernet0/3</pre>
<p>Barah down events, aur Gi0/2 ke saat. <b>Timing</b> check karo, kyunki flap mein repeat hone wala pattern dikhta hai:</p>
<pre class="code">grep "GigabitEthernet0/2" /var/log/remote/routers.log | head -n 4</pre>
<p>Pichhle chapters ne jawab dikhaya: 06:06:08 par down, nau second baad 06:06:17 par up, aur 06:52 tak har kuch minute mein dobara. Regular intervals par nau second ke liye girne wala link physical wajah ki taraf ishara karta hai, jaise kharab cable, gandi fibre ya fail hota SFP, routing ki taraf nahi. Chapter 5 ki report se evidence <b>save</b> karo: top-talker output <code>reports/flaps.txt</code> mein aur note "Action: check cabling on BLR-EDGE-R2 Gi0/2".</p>

<h3>Lab 2: jump host par kaun hamla kar raha hai?</h3>
<p><b>Ticket NK-SEC-88:</b> "raat bhar JUMP01 par bahut SSH login failures". Pehle, kya aap log padh bhi sakte ho?</p>
<pre class="out">netadmin@jump01:~$ ls -l /var/log/auth.log
-rw-r-----  1 syslog   adm        2856 Sep 29 09:00 /var/log/auth.log
netadmin@jump01:~$ id
uid=1001(netadmin) gid=1001(netadmin) groups=1001(netadmin),4(adm),27(sudo)</pre>
<p>Mode <code>rw-r-----</code> ka matlab sirf owner aur <code>adm</code> group padh sakte hain. Aap <code>adm</code> mein ho, isliye <code>sudo</code> ki zaroorat nahi (permissions agle module mein hain). Pehle <b>ginti</b> karo:</p>
<pre class="out">netadmin@jump01:~$ grep -c "Failed password" /var/log/auth.log
19
netadmin@jump01:~$ grep "Failed password" /var/log/auth.log | grep -oE "from [0-9.]+" | sort | uniq -c | sort -rn
     13 from 203.0.113.45
      3 from 198.51.100.7
      2 from 192.0.2.99
      1 from 10.99.0.51</pre>
<p>Unnees failures, 13 ek hi address se (203.0.113.45 documentation address hai jo attacker ki jagah khada hai). Kaunse usernames guess kiye gaye?</p>
<pre class="out">netadmin@jump01:~$ grep -o "invalid user [a-z]*" /var/log/auth.log | awk '{print $3}' | sort -u
admin
cisco
guest
oracle
pi
test
ubnt</pre>
<p>Saat default usernames jo attackers hamesha try karte hain. Inme se koi hamare server par maujood nahi. Sabse zaroori sawal: <b>kya koi andar aaya?</b></p>
<pre class="out">netadmin@jump01:~$ grep Accepted /var/log/auth.log
Sep 29 02:00:23 jump01 sshd[2101]: Accepted publickey for netadmin from 10.99.0.50 port 52101 ssh2
Sep 29 02:02:29 jump01 sshd[2116]: Accepted password for priya from 10.99.0.51 port 52116 ssh2</pre>
<p>Do successful logins, dono internal 10.99.0.x management network se: engineer netadmin aur priya. Bahar ke addresses se koi success nahi. 10.99.0.51 ka ek failure shayad priya ka galat password tha, sahi se pehle; ek quick check kaafi hai, alarm nahi. Ab firewall team ke liye list <b>save</b> karo, internal addresses chhodkar:</p>
<pre class="out">netadmin@jump01:~$ grep "Failed password" /var/log/auth.log | grep -oE "from [0-9.]+" | awk '{print $2}' | grep -v "^10\\.99\\." | sort -u &gt; blocklist.txt
netadmin@jump01:~$ cat blocklist.txt
192.0.2.99
198.51.100.7
203.0.113.45</pre>
<p><code>grep -v</code> match karne wali lines hata deta hai. Pattern <code>^10\\.99\\.</code> ka matlab "10.99. se shuru" (backslash dot ko literal banata hai). List bhejne se pehle hamesha review karo: jis blocklist mein aapka apna management network ho woh aapka apna access kaat deti hai.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Log ke har address ko block karna, apna address check kiye bina. (2) Ek command se "attack" ya "safe" ka nateeja nikalna; <code>grep Accepted</code> se confirm karo. (3) Ginti ke bajay poora log aankhon se padhna. (4) Jo file aapka group already padh sakta hai uske liye <code>sudo</code> try karna; jo least privilege kaam kare wahi use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Failed logins mein <code>Failed password</code> dikhta hai; successful mein <code>Accepted</code>. Investigation ke jawab counts aur addresses hote hain, raw log lines nahi.</p></div>

<div class="scn"><h4>Chupchap success</h4><p>Night-shift engineer ne sainkdon SSH failures dekhe aur jump host band karna chaha. Usse pehle ek senior ne do commands chalaye: source ke hisaab se failure count aur <code>grep Accepted</code>. Bahar se har login fail tha, isliye sirf blocklist firewall team ko gayi aur host chalta raha.</p><p><b>Lesson:</b> ginti karo, phir success check karo, phir action lo.</p></div>

<div class="iv"><p class="q">"Bahut saare SSH login failures ki investigation kaise karoge?"</p><p>Main <code>grep</code>, <code>sort</code> aur <code>uniq -c</code> se har source address ke failed logins ginta hoon, try kiye gaye usernames list karta hoon, phir <code>Accepted</code> lines dekhta hoon ki kya kisi untrusted address se koi andar aaya. Addresses nikalta hoon, apni internal range hatata hoon, <code>&gt;</code> se file mein likhta hoon, aur firewall team ko dene se pehle review karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loop: dekho, chhaanto, ginti, save.</li>
<li>Timing aur counts wajah batate hain: regular chhote drops matlab physical problem.</li>
<li>Kisi cheez ko attack kehne se pehle success lines (<code>Accepted</code>) hamesha check karo.</li>
<li>Firewall tak pahunchne se pehle generated blocklist review karo.</li>
</ul></div>
`}};export{e as default};