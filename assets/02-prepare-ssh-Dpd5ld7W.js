var e={id:`prepare-ssh`,h:{en:`Preparing a router for SSH: the eight lines`,hi:`Router ko SSH ke liye ready karna: aath lines`},body:{en:`

<p>Before any script can log in to a router, the router must accept an SSH connection. Think of a hotel: the building can exist, but a guest cannot enter until the door is unlocked, the reception desk is open and a room key has been printed in the guest's name. Router SSH needs the same three things.</p>

<h3>What SSH is, in one paragraph</h3>
<p><b>SSH</b> (Secure Shell) is an encrypted way to type commands on a remote device. It replaced <b>Telnet</b>, which sent everything, including passwords, as readable text. SSH works over <b>TCP port 22</b>. <b>Version 2</b> is the modern one and the only one you should allow. When your script connects, the router proves who it is with an <b>RSA key pair</b> (a public key it shows to everyone and a private key it never shares), and then the session is encrypted.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Three things must be ready before a script can log in: an open port 22, a vty line that allows SSH, and a valid user."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="50" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="65" y="77" text-anchor="middle" class="svg-ink" font-size="14">AUTO</text><text x="65" y="95" text-anchor="middle" class="svg-muted" font-size="12">the script</text><rect x="170" y="50" width="110" height="60" rx="10" fill="#fde68a"/><text x="225" y="77" text-anchor="middle" class="svg-ink" font-size="14">TCP 22</text><text x="225" y="95" text-anchor="middle" class="svg-muted" font-size="12">door open?</text><rect x="330" y="50" width="130" height="60" rx="10" fill="#bae6fd"/><text x="395" y="77" text-anchor="middle" class="svg-ink" font-size="14">vty line</text><text x="395" y="95" text-anchor="middle" class="svg-muted" font-size="12">login local</text><rect x="510" y="50" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="570" y="77" text-anchor="middle" class="svg-ink" font-size="14">netops</text><text x="570" y="95" text-anchor="middle" class="svg-muted" font-size="12">privilege 15</text><line x1="120" y1="80" x2="170" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="280" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="460" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="225" y="135" text-anchor="middle" class="svg-accent" font-size="12">RSA key + ssh version 2</text><text x="395" y="135" text-anchor="middle" class="svg-accent" font-size="12">transport input ssh</text><text x="570" y="135" text-anchor="middle" class="svg-accent" font-size="12">username ... secret</text></svg><p class="cap">Three things must be ready before a script can log in: an open port 22, a vty line that allows SSH, and a valid user.</p></div>

<h3>The eight lines, explained</h3>
<p>You type these once per router in configuration mode. The lab router R3 is a new router that does not have them yet, which is why its backup fails in Lab 1.</p>
<pre class="code">hostname R3
ip domain name nk.lab
username netops privilege 15 secret NK@2026
crypto key generate rsa modulus 2048
ip ssh version 2
line vty 0 4
 login local
 transport input ssh</pre>
<ul>
<li><code>hostname R3</code>: the router name. The key is named after the hostname plus the domain, so set it first.</li>
<li><code>ip domain name nk.lab</code>: a domain name. IOS refuses to make an RSA key without one.</li>
<li><code>username netops privilege 15 secret NK@2026</code>: a <b>local user</b>. <code>secret</code> stores the password hashed. <code>privilege 15</code> is the highest level; the user lands directly in enable mode (prompt <code>R3#</code>), so a script can run show and configuration commands without an extra enable password.</li>
<li><code>crypto key generate rsa modulus 2048</code>: makes the key pair. 2048 bits is the sensible minimum today.</li>
<li><code>ip ssh version 2</code>: accept only SSH version 2.</li>
<li><code>line vty 0 4</code>: the five <b>virtual terminal lines</b>, which are the doors for remote logins. They are called "virtual" because there is no physical port.</li>
<li><code>login local</code>: check the username and password against the local user list.</li>
<li><code>transport input ssh</code>: allow only SSH on these lines, so Telnet is refused.</li>
</ul>

<h3>Check the door before you write code</h3>
<p>Always test SSH by hand first. If it does not work by hand, it will not work from a script. This is R3 <b>before</b> the setup:</p>
<pre class="out">R3# show ip ssh
<span class="hl">SSH Disabled - version 1.99</span>
%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).
...</pre>
<p>Now the router has no key, so SSH is off. Notice that a ping to R3 still works, because ping is a different protocol and does not need SSH:</p>
<pre class="out">AUTO&gt; ping 10.99.0.3
84 bytes from 10.99.0.3 icmp_seq=1 ttl=255 time=0.500 ms
...</pre>
<p>After typing the eight lines (the key generation takes a few seconds and prints a message), the same command shows the difference:</p>
<pre class="out">R3# show ip ssh
<span class="hl">SSH Enabled - version 2.0</span>
...</pre>

<div class="eg"><p><b>Worked example.</b> A new branch router arrives. You console in and type the eight lines with the real hostname. You run <code>show ip ssh</code> and read <code>SSH Enabled - version 2.0</code>. From the AUTO host you try one login by hand. Only now do you add the router's IP to the script's list. This order, router first, hand test second, script third, saves hours of guessing which part is broken.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Forgetting <code>ip domain name</code>, so the key command fails. (2) Generating the key before setting the hostname, so the key carries a wrong name. (3) Using <code>login</code> instead of <code>login local</code>, so the vty line asks for a line password that does not exist. (4) Leaving <code>transport input all</code>, which keeps Telnet open.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ping working does not prove SSH works. Also know that <code>transport input ssh</code> makes the router refuse the TCP connection for Telnet, and that SSH needs a hostname, a domain name and an RSA key.</p></div>

<div class="scn"><h4>Ping works, script times out</h4><p>The night shift ran a backup script and it failed on R3 with a timeout. R3 answered ping, so the engineer blamed the network. Then she ran <code>show ip ssh</code> on the R3 console and read "SSH Disabled". The router had been replaced after a hardware fault and nobody had re-created the RSA key. She typed the eight lines, tested one manual login, and the script ran.</p><p><b>Lesson:</b> a reachable router and a router that accepts SSH are two different facts. Test the second one.</p></div>

<div class="iv"><p class="q">"What do you need to configure on a Cisco router before a script can SSH to it?"</p><p>Hostname and domain name, an RSA key of at least 2048 bits, <code>ip ssh version 2</code>, a local user with the right privilege, and vty lines with <code>login local</code> and <code>transport input ssh</code>. Add that in production you would also restrict who may connect with an access class and use AAA instead of local users.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSH uses TCP 22 and replaces Telnet because it is encrypted; allow version 2 only.</li>
<li>The router needs a hostname, a domain name and an RSA key (2048 bits).</li>
<li><code>login local</code> plus <code>username ... privilege 15 secret ...</code> gives the script a valid login that lands in enable mode.</li>
<li><code>transport input ssh</code> keeps Telnet out.</li>
<li>Verify with <code>show ip ssh</code> and a manual login before you write any code.</li>
</ul></div>

`,hi:`

<p>Koi bhi script router mein login kare, usse pehle router ko SSH connection accept karna padta hai. Hotel ke jaisa socho: building maujood hai, par guest tab tak andar nahi ja sakta jab tak darwaza khula na ho, reception desk chalu na ho aur guest ke naam ki room key na bani ho. Router SSH ko bhi yahi teen cheezein chahiye.</p>

<h3>SSH ek paragraph mein</h3>
<p><b>SSH</b> (Secure Shell) remote device par commands type karne ka encrypted tareeka hai. Isne <b>Telnet</b> ki jagah li, jo sab kuch, passwords bhi, padhne layak text mein bhejta tha. SSH <b>TCP port 22</b> par chalta hai. <b>Version 2</b> modern hai aur sirf wahi allow karna chahiye. Jab aapka script connect karta hai, router apni pehchaan <b>RSA key pair</b> (ek public key jo sabko dikhata hai aur ek private key jo kabhi share nahi karta) se saabit karta hai, phir session encrypted ho jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Script login kare, usse pehle teen cheezein ready honi chahiye: khula port 22, SSH allow karne wali vty line, aur valid user."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="50" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="65" y="77" text-anchor="middle" class="svg-ink" font-size="14">AUTO</text><text x="65" y="95" text-anchor="middle" class="svg-muted" font-size="12">script</text><rect x="170" y="50" width="110" height="60" rx="10" fill="#fde68a"/><text x="225" y="77" text-anchor="middle" class="svg-ink" font-size="14">TCP 22</text><text x="225" y="95" text-anchor="middle" class="svg-muted" font-size="12">darwaza khula?</text><rect x="330" y="50" width="130" height="60" rx="10" fill="#bae6fd"/><text x="395" y="77" text-anchor="middle" class="svg-ink" font-size="14">vty line</text><text x="395" y="95" text-anchor="middle" class="svg-muted" font-size="12">login local</text><rect x="510" y="50" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="570" y="77" text-anchor="middle" class="svg-ink" font-size="14">netops</text><text x="570" y="95" text-anchor="middle" class="svg-muted" font-size="12">privilege 15</text><line x1="120" y1="80" x2="170" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="280" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="460" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="225" y="135" text-anchor="middle" class="svg-accent" font-size="12">RSA key + ssh version 2</text><text x="395" y="135" text-anchor="middle" class="svg-accent" font-size="12">transport input ssh</text><text x="570" y="135" text-anchor="middle" class="svg-accent" font-size="12">username ... secret</text></svg><p class="cap">Script login kare, usse pehle teen cheezein ready honi chahiye: khula port 22, SSH allow karne wali vty line, aur valid user.</p></div>

<h3>Aath lines, explain ke saath</h3>
<p>Inhe har router par ek baar configuration mode mein type karte ho. Lab router R3 naya router hai jisme yeh abhi nahi hain, isliye Lab 1 mein uska backup fail hota hai.</p>
<pre class="code">hostname R3
ip domain name nk.lab
username netops privilege 15 secret NK@2026
crypto key generate rsa modulus 2048
ip ssh version 2
line vty 0 4
 login local
 transport input ssh</pre>
<ul>
<li><code>hostname R3</code>: router ka naam. Key ka naam hostname plus domain se banta hai, isliye pehle yeh set karo.</li>
<li><code>ip domain name nk.lab</code>: domain name. IOS domain ke bina RSA key banane se mana kar deta hai.</li>
<li><code>username netops privilege 15 secret NK@2026</code>: ek <b>local user</b>. <code>secret</code> password ko hashed store karta hai. <code>privilege 15</code> sabse ooncha level hai; user seedha enable mode (prompt <code>R3#</code>) mein pahunchta hai, isliye script bina extra enable password ke show aur configuration commands chala sakta hai.</li>
<li><code>crypto key generate rsa modulus 2048</code>: key pair banata hai. Aaj ke liye 2048 bits sahi minimum hai.</li>
<li><code>ip ssh version 2</code>: sirf SSH version 2 accept karo.</li>
<li><code>line vty 0 4</code>: paanch <b>virtual terminal lines</b>, jo remote login ke darwaze hain. Inhe "virtual" kehte hain kyunki inka koi physical port nahi hota.</li>
<li><code>login local</code>: username aur password ko local user list se check karo.</li>
<li><code>transport input ssh</code>: in lines par sirf SSH allow karo, taaki Telnet mana ho jaaye.</li>
</ul>

<h3>Code likhne se pehle darwaza check karo</h3>
<p>SSH ko hamesha pehle haath se test karo. Haath se nahi chalta to script se bhi nahi chalega. Yeh R3 hai setup se <b>pehle</b>:</p>
<pre class="out">R3# show ip ssh
<span class="hl">SSH Disabled - version 1.99</span>
%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).
...</pre>
<p>Ab router ke paas key nahi hai, isliye SSH band hai. Dhyaan do ki R3 ko ping abhi bhi chalta hai, kyunki ping alag protocol hai aur use SSH nahi chahiye:</p>
<pre class="out">AUTO&gt; ping 10.99.0.3
84 bytes from 10.99.0.3 icmp_seq=1 ttl=255 time=0.500 ms
...</pre>
<p>Aath lines type karne ke baad (key banane mein kuch second lagte hain aur ek message print hota hai), wahi command farak dikhata hai:</p>
<pre class="out">R3# show ip ssh
<span class="hl">SSH Enabled - version 2.0</span>
...</pre>

<div class="eg"><p><b>Worked example.</b> Naya branch router aata hai. Aap console se login karke asli hostname ke saath aath lines type karte ho. <code>show ip ssh</code> chalate ho aur <code>SSH Enabled - version 2.0</code> padhte ho. AUTO host se ek login haath se try karte ho. Tabhi aap router ka IP script ki list mein jodte ho. Yeh order, pehle router, phir haath ka test, phir script, ghanton ki guesswork bachata hai ki kaunsa hissa toota hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) <code>ip domain name</code> bhool jaana, isliye key command fail hota hai. (2) Hostname set karne se pehle key banana, isliye key ka naam galat aata hai. (3) <code>login local</code> ki jagah <code>login</code> use karna, isliye vty line aisa line password maangti hai jo hai hi nahi. (4) <code>transport input all</code> chhod dena, jisse Telnet khula rehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ping chalna saabit nahi karta ki SSH chalta hai. Yeh bhi jaano ki <code>transport input ssh</code> Telnet ke liye router ko TCP connection refuse karwata hai, aur SSH ko hostname, domain name aur RSA key chahiye.</p></div>

<div class="scn"><h4>Ping chalta hai, script timeout deta hai</h4><p>Night shift ne backup script chalayi aur woh R3 par timeout ke saath fail hui. R3 ping ka jawab deta tha, isliye engineer ne network ko doshi mana. Phir usne R3 console par <code>show ip ssh</code> chalaya aur "SSH Disabled" padha. Hardware fault ke baad router badla gaya tha aur kisi ne RSA key dobara nahi banayi thi. Usne aath lines type ki, ek manual login test kiya, aur script chal gayi.</p><p><b>Lesson:</b> router ka reachable hona aur router ka SSH accept karna do alag baatein hain. Doosri ko test karo.</p></div>

<div class="iv"><p class="q">"Script SSH kar sake, uske liye Cisco router par kya configure karna padta hai?"</p><p>Hostname aur domain name, kam se kam 2048 bit ki RSA key, <code>ip ssh version 2</code>, sahi privilege wala local user, aur <code>login local</code> aur <code>transport input ssh</code> wali vty lines. Jodo ki production mein aap access class se restrict karoge ki kaun connect kar sakta hai aur local users ki jagah AAA use karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSH TCP 22 use karta hai aur Telnet ki jagah leta hai kyunki encrypted hai; sirf version 2 allow karo.</li>
<li>Router ko hostname, domain name aur RSA key (2048 bits) chahiye.</li>
<li><code>login local</code> aur <code>username ... privilege 15 secret ...</code> script ko valid login dete hain jo enable mode mein land karta hai.</li>
<li><code>transport input ssh</code> Telnet ko bahar rakhta hai.</li>
<li>Code likhne se pehle <code>show ip ssh</code> aur manual login se verify karo.</li>
</ul></div>

`}};export{e as default};