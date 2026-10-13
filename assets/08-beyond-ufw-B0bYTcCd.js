var e=e=>`<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Firewall tool layers">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">ufw  (short human commands, app profiles)</text>
<rect x="10" y="58" width="300" height="40" rx="8" fill="#fed7aa"/><text x="160" y="83" text-anchor="middle" class="svg-ink" font-size="13">iptables  (classic rule tool)</text>
<rect x="330" y="58" width="300" height="40" rx="8" fill="#ddd6fe"/><text x="480" y="83" text-anchor="middle" class="svg-ink" font-size="13">nftables  (newer rule tool)</text>
<rect x="10" y="106" width="620" height="40" rx="8" fill="#fecaca"/><text x="320" y="131" text-anchor="middle" class="svg-ink" font-size="13">netfilter  (packet filter in the kernel)</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@nms03:~$ sudo iptables -L -n</pre>
<pre class="out">Chain INPUT (policy DROP)
target     prot opt source               destination
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED
ACCEPT     icmp --  anywhere             anywhere             icmp echo-request
ACCEPT     tcp  --  10.99.0.0/24         anywhere             tcp dpt:22
ACCEPT     udp  --  10.99.0.0/24         anywhere             udp dpt:514
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:80

Chain FORWARD (policy DROP)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination</pre>`,n=`<pre class="code">netadmin@nms03:~$ sudo ufw app list</pre>
<pre class="out">Available applications:
  OpenSSH
  Nginx Full
  Nginx HTTP</pre>`,r=`<pre class="code">netadmin@nms03:~$ sudo ufw show added</pre>
<pre class="out">Added user rules (see 'ufw status' for running firewall):
ufw allow 23/tcp</pre>`,i=`<pre class="code"><span class="c"># Reference commands (not run in the simulator)</span>
<span class="c"># iptables: the same three rules, written by hand</span>
sudo iptables -P INPUT DROP
sudo iptables -A INPUT -p tcp -s 10.99.0.0/24 --dport 22 -j ACCEPT
sudo iptables -A INPUT -p udp -s 10.99.0.0/24 --dport 514 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT

<span class="c"># nftables: show everything the kernel currently has</span>
sudo nft list ruleset

<span class="c"># ufw: open by application profile name</span>
sudo ufw allow 'Nginx Full'
sudo ufw app info 'Nginx Full'</pre>`,a={id:`beyond-ufw`,h:{en:`Beyond ufw: iptables, nftables and application profiles`,hi:`ufw ke aage: iptables, nftables aur application profiles`},body:{en:`
<p>You will meet servers that do not have ufw installed. Red Hat style systems use <b>firewalld</b>, appliances use <b>iptables</b> directly, and newer systems use <b>nftables</b>. The good news is that they all talk to the same kernel filter. If you understand what ufw builds, you can read the others.</p>
`+e(`Different tools, one packet filter in the kernel.`)+`
<h3>iptables: the classic view</h3>
<p>You already used <code>iptables -L -n</code> in earlier chapters. Here it is again with a three-rule configuration, now read in detail:</p>
`+t+`
<dl class="terms">
<dt>Chain</dt><dd>A list of rules for one direction. <b>INPUT</b> is traffic for this server, <b>OUTPUT</b> is traffic from this server, <b>FORWARD</b> is traffic passing through.</dd>
<dt>policy</dt><dd>The default action of the chain, used when no rule matches. INPUT is <b>DROP</b>: default deny.</dd>
<dt>target</dt><dd>What to do: ACCEPT allows, DROP discards silently, REJECT answers with an error.</dd>
<dt>ctstate RELATED,ESTABLISHED</dt><dd>Connection tracking. The kernel remembers connections; packets that belong to a conversation the server already allowed pass automatically. This is why replies work without extra rules.</dd>
<dt>dpt</dt><dd>Destination port.</dd>
</dl>
<p>iptables rules are checked top to bottom, with the first match winning, exactly like ufw. That is no accident: ufw simply writes iptables lines for you. A hand-written equivalent is shown in the reference block below. It is the same plan, in the longer notation. Notice how much easier the ufw sentence is to read.</p>

<h3>nftables: the newer tool</h3>
<p><b>nftables</b> replaces iptables with a cleaner syntax and one tool, <code>nft</code>. The idea is the same: tables contain chains, chains contain rules, rules have matches and actions, and chains have a default policy. The single command <code>nft list ruleset</code> prints every rule the kernel holds. Many modern distributions run nftables underneath, even when you type iptables or ufw. On the simulator server this command is not installed, so it appears only in the reference block, and you should not expect output from it here.</p>
`+i+`
<h3>Application profiles</h3>
<p>Packages can ship a small description of the ports they need. ufw reads these as <b>application profiles</b>, so you can open an application by name instead of by port numbers:</p>
`+n+`
<p>Three profiles are available: OpenSSH (port 22), Nginx HTTP (port 80) and Nginx Full (ports 80 and 443). Opening by profile is quick, but remember what you learned: it opens the ports <b>from Anywhere</b> unless you write a long-form rule. The reference block shows <code>ufw app info</code>, which prints what a profile contains. Always read it before you allow it.</p>

<h3>Where do the rules live?</h3>
<p>ufw keeps your rules in files under <code>/etc/ufw</code>, loads them when the system starts and, with <code>enable</code>, makes sure that happens on every boot. You can always ask ufw what you added:</p>
`+r+`
<p>This is the list of commands you gave, not the running state; it works even when the firewall is inactive. When you write a change record, this output is useful to paste. A different style of safety net: keep your intended rule set in a text file (a script of ufw commands), kept under version control. Then a new server can be built identically, and a review can compare the file to the live state. This is how firewall rules become <b>configuration as code</b>.</p>

<div class="eg"><p><b>Worked example.</b> You log in to an unfamiliar server and must find out what is allowed. Step 1: <code>sudo ufw status verbose</code>. If it says "command not found" or inactive, step 2: <code>sudo iptables -L -n</code> to see the kernel rules. Step 3: <code>sudo nft list ruleset</code> in case the host uses nftables. Whichever tool you find, apply the same questions: what is the default policy, which sources and ports are allowed, and in which order?</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Mixing tools on one host (ufw rules plus hand-typed iptables rules) so that nobody knows what is active; running <code>iptables -F</code> to flush rules on a server with default DROP policy and cutting yourself off; allowing an application profile without reading it.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which is the kernel firewall: ufw, iptables or netfilter?" Netfilter is in the kernel. iptables, nftables and ufw are tools that configure it.</p></div>
<div class="scn"><h4>Two tools, one mystery</h4><p>A server had rules in ufw and, added long ago by a script, hand-written iptables lines that accepted a legacy port. The audit looked only at <code>ufw status</code> and said "clean". An engineer ran <code>iptables -L -n</code> and found the extra line. The team removed the script and used ufw only.</p><p><b>Lesson:</b> check what the kernel really has, not only what your favourite tool shows.</p></div>
<div class="iv"><p class="q">"What is the relationship between ufw, iptables and nftables?"</p><p>All three configure netfilter, the packet filter in the Linux kernel. iptables is the classic rule tool and nftables its modern successor. ufw is a simplified front end that generates their rules. I use ufw for readability and iptables or nft to verify what is actually loaded.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One kernel filter (netfilter), several tools. Learn the model once.</li>
<li><code>iptables -L -n</code> shows chains, policy, targets, sources and <code>dpt</code> ports.</li>
<li><code>ufw app list</code> shows application profiles; read a profile before allowing it.</li>
<li><code>ufw show added</code> lists the rules you added; keep your rule set as code.</li>
</ul></div>
`,hi:`
<p>Aapko aise servers milenge jin par ufw install nahi hoga. Red Hat style systems <b>firewalld</b> use karte hain, appliances seedha <b>iptables</b>, aur naye systems <b>nftables</b>. Achhi baat yeh hai ki sab ek hi kernel filter se baat karte hain. Agar aap samajhte ho ki ufw kya banata hai, to baaki padh sakte ho.</p>
`+e(`Alag tools, kernel mein ek hi packet filter.`)+`
<h3>iptables: classic view</h3>
<p>Pichhle chapters mein aap <code>iptables -L -n</code> use kar chuke ho. Yeh teen-rule configuration ke saath dobara hai, ab detail mein padhte hue:</p>
`+t+`
<dl class="terms">
<dt>Chain</dt><dd>Ek direction ke rules ki list. <b>INPUT</b> is server ki taraf ka traffic, <b>OUTPUT</b> is server se nikalta traffic, <b>FORWARD</b> guzarta traffic.</dd>
<dt>policy</dt><dd>Chain ka default action, jab koi rule match na ho. INPUT <b>DROP</b> hai: default deny.</dd>
<dt>target</dt><dd>Kya karna hai: ACCEPT allow, DROP chupchaap discard, REJECT error se jawab.</dd>
<dt>ctstate RELATED,ESTABLISHED</dt><dd>Connection tracking. Kernel connections yaad rakhta hai; jo packets us baatcheet ke hain jise server pehle allow kar chuka, woh apne aap guzar jaate hain. Isiliye replies bina extra rules ke kaam karte hain.</dd>
<dt>dpt</dt><dd>Destination port.</dd>
</dl>
<p>iptables rules upar se neeche check hote hain, pehla match jeetta hai, bilkul ufw ki tarah. Yeh sanyog nahi: ufw bas aapke liye iptables lines likhta hai. Haath se likha barabar neeche reference block mein hai. Wahi plan, lambe notation mein. Dekho ufw ka vaakya padhna kitna aasaan hai.</p>

<h3>nftables: naya tool</h3>
<p><b>nftables</b> iptables ki jagah saaf syntax aur ek tool, <code>nft</code>, deta hai. Idea wahi: tables mein chains, chains mein rules, rules ke matches aur actions, aur chains ki default policy. Ek command <code>nft list ruleset</code> kernel ke paas har rule print karta hai. Kai modern distributions neeche nftables chalate hain, tab bhi jab aap iptables ya ufw type karo. Simulator server par yeh command install nahi hai, isliye sirf reference block mein hai, aur yahan iska output expect mat karo.</p>
`+i+`
<h3>Application profiles</h3>
<p>Packages ek chhota description ship kar sakte hain ki unhe kaunse ports chahiye. ufw ise <b>application profiles</b> ki tarah padhta hai, isliye aap application ko port numbers ki jagah naam se khol sakte ho:</p>
`+n+`
<p>Teen profiles hain: OpenSSH (port 22), Nginx HTTP (port 80) aur Nginx Full (ports 80 aur 443). Profile se kholna tez hai, par jo seekha yaad rakho: yeh ports <b>Anywhere se</b> kholta hai jab tak aap lamba-form rule na likho. Reference block <code>ufw app info</code> dikhata hai, jo profile mein kya hai print karta hai. Allow karne se pehle hamesha padho.</p>

<h3>Rules kahan rehte hain?</h3>
<p>ufw aapke rules <code>/etc/ufw</code> ke neeche files mein rakhta hai, system start par load karta hai aur <code>enable</code> ke saath yeh har boot par ho, yeh pakka karta hai. Aap hamesha ufw se pooch sakte ho ki aapne kya joda:</p>
`+r+`
<p>Yeh aapke diye commands ki list hai, running state nahi; firewall inactive ho tab bhi kaam karta hai. Change record likhte waqt yeh output paste karne ke kaam aata hai. Safety net ka ek alag tareeka: apna iraada wala rule set ek text file (ufw commands ki script) mein rakho, version control mein. Phir naya server bilkul waisa hi ban sakta hai, aur review file ko live state se compare kar sakta hai. Aise firewall rules <b>configuration as code</b> ban jaate hain.</p>

<div class="eg"><p><b>Worked example.</b> Anjaan server par login karte ho aur pata lagana hai ki kya allowed hai. Step 1: <code>sudo ufw status verbose</code>. Agar "command not found" ya inactive kahe, step 2: <code>sudo iptables -L -n</code> kernel rules dekhne ke liye. Step 3: <code>sudo nft list ruleset</code> agar host nftables use karta ho. Jo bhi tool mile, wahi sawaal lagao: default policy kya hai, kaunse sources aur ports allowed hain, aur kis order mein?</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Ek host par tools milana (ufw rules aur haath se type iptables rules) taaki kisi ko pata na ho kya active hai; default DROP policy wale server par rules flush karne ke liye <code>iptables -F</code> chalakar khud ko kaat dena; application profile bina padhe allow karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kernel firewall kaunsa hai: ufw, iptables ya netfilter?" Netfilter kernel mein hai. iptables, nftables aur ufw use configure karne wale tools hain.</p></div>
<div class="scn"><h4>Do tools, ek paheli</h4><p>Ek server par ufw mein rules the aur, bahut pehle kisi script ne joda, haath se likhi iptables lines jo ek purana port accept karti thi. Audit ne sirf <code>ufw status</code> dekha aur "clean" kaha. Ek engineer ne <code>iptables -L -n</code> chalaya aur extra line dhoondh li. Team ne script hataya aur sirf ufw use kiya.</p><p><b>Lesson:</b> check karo ki kernel ke paas asal mein kya hai, sirf yeh nahi ki aapka pasandida tool kya dikhata hai.</p></div>
<div class="iv"><p class="q">"ufw, iptables aur nftables mein kya rishta hai?"</p><p>Teeno netfilter ko configure karte hain, jo Linux kernel mein packet filter hai. iptables classic rule tool hai aur nftables uska modern successor. ufw ek simplified front end hai jo unke rules generate karta hai. Padhne ki aasaani ke liye ufw use karta hoon aur asal mein kya loaded hai verify karne ke liye iptables ya nft.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek kernel filter (netfilter), kai tools. Model ek baar seekho.</li>
<li><code>iptables -L -n</code> chains, policy, targets, sources aur <code>dpt</code> ports dikhata hai.</li>
<li><code>ufw app list</code> application profiles dikhata hai; allow karne se pehle profile padho.</li>
<li><code>ufw show added</code> aapke jode rules list karta hai; rule set ko code ki tarah rakho.</li>
</ul></div>
`}};export{a as default};