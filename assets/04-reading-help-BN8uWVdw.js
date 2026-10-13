var e={id:`reading-help`,h:{en:`Looking inside files, and getting help: cat, less, file, stat, man`,hi:`Files ke andar dekhna aur help lena: cat, less, file, stat, man`},body:{en:`
<p><b>The idea of this chapter:</b> you can now find a file. Next you must <b>read</b> it, learn what kind of file it is, and know where to look when you forget how a command works. Reading never changes anything, so practise freely.</p>

<h3>cat: print a whole file</h3>
<p><code>cat</code> (short for <i>concatenate</i>) prints a file on the screen. It is perfect for short files such as a note or a router config:</p>
<pre class="out">netadmin@nms01:~$ cat incoming/.handover.txt
Night shift hand-over (Sagar):
- Router configs (names ending in -R1, -R2, -R3) go to ~/archive/routers
- Switch configs (names ending in -SW1, -SW2) go to ~/archive/switches
- The .bak file is an old broken copy. Delete it.
- Ticket for this job: NK-2207
netadmin@nms01:~$ cat incoming/HYD-EDGE-R3.cfg
!
hostname HYD-EDGE-R3
!
interface GigabitEthernet0/0
 ip address 10.40.3.1 255.255.255.0
 no shutdown
ip route 0.0.0.0 0.0.0.0 10.40.3.254
!
end</pre>
<p>Configuration files on a server look just like a router config, because they are text. That is why the tools in this track work on both.</p>
<p><code>cat</code> with several names prints them one after another. For a long file (a log with thousands of lines) <code>cat</code> floods the screen. Use a pager instead.</p>

<h3>less: read a long file page by page</h3>
<p>A <b>pager</b> shows one screen at a time. <code>less</code> is the standard one:</p>
<pre class="code">less /var/log/syslog</pre>
<p>Inside <code>less</code>: <b>Space</b> = next page, <b>b</b> = previous page, <b>/text</b> = search for text (then <b>n</b> for the next match), <b>G</b> = jump to the end, <b>g</b> = jump to the start, <b>q</b> = quit. If you ever see a screen that will not return to the prompt, press <code>q</code>. In the simulator <code>less</code> simply prints the file; on a real server it is interactive, so this paragraph is a reference.</p>
<p>The quick peeks <code>head</code> (first lines) and <code>tail</code> (last lines) are covered in the next module, together with <code>tail -f</code> for watching a log live.</p>

<h3>file and stat: what is this thing?</h3>
<p>A name like <code>backup</code> does not tell you if it is text, a directory or a compressed archive. <code>file</code> looks inside and tells you. <code>stat</code> shows the full facts of a file: size, permissions, owner and times.</p>
<pre class="out">netadmin@nms01:~$ file incoming/PUN-CORE-R1.cfg
incoming/PUN-CORE-R1.cfg: ASCII text
netadmin@nms01:~$ file /etc
/etc: directory
netadmin@nms01:~$ stat incoming/PUN-CORE-R1.cfg
  File: incoming/PUN-CORE-R1.cfg
  Size: 146		Blocks: 8          IO Block: 4096   regular file
Access: (0644/-rw-r--r--)  Uid: ( 1001/netadmin)  Gid: ( 1001/netadmin)
Modify: 2026-09-29 09:00:00.000000000 +0530</pre>
<p>Real Linux prints a few more lines (inode, links, Access and Change times); the simulator shows the main ones. The line <code>Access: (0644/-rw-r--r--)</code> gives permissions in both number and letter form. You will meet that number in the lx-users module.</p>

<h3>How big, how full: wc, df</h3>
<pre class="out">netadmin@nms01:~$ wc -l incoming/HYD-EDGE-R3.cfg
9 incoming/HYD-EDGE-R3.cfg
netadmin@nms01:~$ df -h
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           197M  1.1M  196M   1% /run
/dev/sda2        25G  6.2G   18G  27% /
tmpfs           982M     0  982M   0% /dev/shm
/dev/sda1       1.1G  6.1M  1.1G   1% /boot/efi</pre>
<p><code>wc -l</code> counts lines. <code>df -h</code> (disk free) shows how full each disk is. A syslog server whose root disk reaches 100% stops writing logs, so network engineers check <code>df -h</code> early in an investigation.</p>
<p><b>Reference commands (not run in the simulator):</b></p>
<pre class="code">du -sh /var/log        # total size of a directory, readable
du -sh /var/log/* | sort -h   # sizes of everything inside, smallest first</pre>

<h3>Getting help: man, --help, which, type</h3>
<p>Nobody remembers every option. Linux has the manual built in:</p>
<pre class="code">man ls          # the manual page for ls (q to quit)
ls --help       # a short summary of options
which ls        # where is the program?
type cd         # is it a program or built into the shell?</pre>
<pre class="out">netadmin@nms01:~$ which ls
/usr/bin/ls
netadmin@nms01:~$ type cd
cd is a shell builtin
netadmin@nms01:~$ man ls
LS(1)

NAME
       ls - list directory contents

COMMON USE
       ls -l        long listing (permissions, owner, size)
       ls -la       include hidden files
       ls -lh       human readable sizes</pre>
<p>The simulator shows a short teaching version of the manual page. A real server shows many pages of options, which you scroll with the same keys as <code>less</code>. <code>ls --help</code> works on a real server, but the simulator does not print its option summary. The manual page is the authority; use it when you meet an unknown option in someone's script.</p>

<h3>History: do not type twice</h3>
<pre class="out">netadmin@nms01:~$ history
    1  pwd
    2  whoami
    3  ls
    4  ls -l
    5  ls -la incoming
    6  history</pre>
<p><code>history</code> lists your previous commands. On a real server, <b>Ctrl+R</b> lets you search it: press Ctrl+R, type a few letters of an old command, and press Enter. <code>!!</code> repeats the last command (handy as <code>sudo !!</code>).</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Using <code>cat</code> on a huge log or a binary file: the screen fills with noise. Press Ctrl+C to stop it, then use <code>less</code>. (2) Trusting a file extension. A file called <code>notes.txt</code> can contain anything; <code>file</code> tells you the truth. (3) Searching the web for every option instead of reading <code>man</code>, which is exact for the version installed on that very server.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>cat</code> prints, <code>less</code> pages, <code>head</code> and <code>tail</code> peek. <code>which</code> finds a program on the PATH; <code>type</code> also recognises shell builtins (like <code>cd</code>) and aliases. <code>cd</code> is a builtin, so <code>which cd</code> may find nothing.</p></div>

<div class="scn"><h4>The disk that was 100% full</h4><p>Router logs stopped arriving at the syslog server on a Monday. Nobody had changed any router. An engineer logged in and ran <code>df -h</code>: the disk holding the logs showed <code>100%</code>. A runaway debug file had filled it over the weekend. She found the big file, removed it, and logs flowed again. The network was never at fault.</p><p><b>Lesson:</b> when a Linux service "stops working", check disk space first, then logs.</p></div>

<div class="iv"><p class="q">"How would you read a 2 GB log file?"</p><p>Not with <code>cat</code>. I would use <code>less</code> to page through it and search with <code>/</code>, or <code>tail -n 100</code> for the latest entries, or <code>grep</code> to pull out only the lines I need. Mention that <code>less</code> does not load the whole file into memory, which is why it is safe on big files.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>cat</code> prints small files; <code>less</code> pages large ones (q quits).</li>
<li><code>file</code> says what a file really is; <code>stat</code> shows size, permissions, owner and times.</li>
<li><code>wc -l</code> counts lines; <code>df -h</code> shows disk usage.</li>
<li><code>man command</code> is the built-in manual; <code>which</code> and <code>type</code> locate commands.</li>
<li><code>history</code> and Ctrl+R save retyping.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> ab aap file dhoondh sakte ho. Agla kaam use <b>padhna</b> hai, yeh jaanna ki woh kis tarah ki file hai, aur command kaise chalta hai bhool jao to kahan dekhna hai. Padhne se kuch nahi badalta, to khul ke practise karo.</p>

<h3>cat: poori file print karo</h3>
<p><code>cat</code> (<i>concatenate</i> ka short) file ko screen par print karta hai. Chhoti files, jaise note ya router config, ke liye perfect:</p>
<pre class="out">netadmin@nms01:~$ cat incoming/.handover.txt
Night shift hand-over (Sagar):
- Router configs (names ending in -R1, -R2, -R3) go to ~/archive/routers
- Switch configs (names ending in -SW1, -SW2) go to ~/archive/switches
- The .bak file is an old broken copy. Delete it.
- Ticket for this job: NK-2207
netadmin@nms01:~$ cat incoming/HYD-EDGE-R3.cfg
!
hostname HYD-EDGE-R3
!
interface GigabitEthernet0/0
 ip address 10.40.3.1 255.255.255.0
 no shutdown
ip route 0.0.0.0 0.0.0.0 10.40.3.254
!
end</pre>
<p>Server par configuration files bilkul router config jaisi dikhti hain, kyunki woh text hain. Isiliye is track ke tools dono par chalte hain.</p>
<p><code>cat</code> ko kai naam do to woh ek ke baad ek print karta hai. Lambi file (hazaaron lines ka log) par <code>cat</code> screen bhar deta hai. Uske liye pager use karo.</p>

<h3>less: lambi file page by page padho</h3>
<p><b>Pager</b> ek baar mein ek screen dikhata hai. <code>less</code> standard hai:</p>
<pre class="code">less /var/log/syslog</pre>
<p><code>less</code> ke andar: <b>Space</b> = agla page, <b>b</b> = pichhla page, <b>/text</b> = text search (phir agle match ke liye <b>n</b>), <b>G</b> = end par jao, <b>g</b> = start par jao, <b>q</b> = bahar. Agar kabhi screen prompt par wapas na aaye to <code>q</code> dabao. Simulator mein <code>less</code> bas file print kar deta hai; real server par yeh interactive hota hai, isliye yeh paragraph reference hai.</p>
<p>Quick peeks <code>head</code> (pehli lines) aur <code>tail</code> (aakhri lines) agle module mein aate hain, saath mein log live dekhne ke liye <code>tail -f</code>.</p>

<h3>file aur stat: yeh cheez hai kya?</h3>
<p><code>backup</code> jaisa naam nahi batata ki woh text hai, directory hai ya compressed archive. <code>file</code> andar dekhkar batata hai. <code>stat</code> file ke poore facts dikhata hai: size, permissions, owner aur times.</p>
<pre class="out">netadmin@nms01:~$ file incoming/PUN-CORE-R1.cfg
incoming/PUN-CORE-R1.cfg: ASCII text
netadmin@nms01:~$ file /etc
/etc: directory
netadmin@nms01:~$ stat incoming/PUN-CORE-R1.cfg
  File: incoming/PUN-CORE-R1.cfg
  Size: 146		Blocks: 8          IO Block: 4096   regular file
Access: (0644/-rw-r--r--)  Uid: ( 1001/netadmin)  Gid: ( 1001/netadmin)
Modify: 2026-09-29 09:00:00.000000000 +0530</pre>
<p>Real Linux kuch aur lines print karta hai (inode, links, Access aur Change times); simulator mukhya lines dikhata hai. Line <code>Access: (0644/-rw-r--r--)</code> permissions number aur letter dono form mein deti hai. Yeh number aap lx-users module mein milenge.</p>

<h3>Kitna bada, kitna bhara: wc, df</h3>
<pre class="out">netadmin@nms01:~$ wc -l incoming/HYD-EDGE-R3.cfg
9 incoming/HYD-EDGE-R3.cfg
netadmin@nms01:~$ df -h
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           197M  1.1M  196M   1% /run
/dev/sda2        25G  6.2G   18G  27% /
tmpfs           982M     0  982M   0% /dev/shm
/dev/sda1       1.1G  6.1M  1.1G   1% /boot/efi</pre>
<p><code>wc -l</code> lines ginta hai. <code>df -h</code> (disk free) har disk kitni bhari hai dikhata hai. Syslog server ki root disk 100% ho jaaye to logs likhna band ho jaata hai, isliye network engineers investigation ki shuruaat mein hi <code>df -h</code> check karte hain.</p>
<p><b>Reference commands (simulator mein nahi chalte):</b></p>
<pre class="code">du -sh /var/log        # directory ka total size, readable
du -sh /var/log/* | sort -h   # andar ki har cheez ka size, chhota pehle</pre>

<h3>Help lena: man, --help, which, type</h3>
<p>Har option kisi ko yaad nahi rehta. Linux mein manual built-in hai:</p>
<pre class="code">man ls          # ls ka manual page (q se bahar)
ls --help       # options ka short summary
which ls        # program kahan hai?
type cd         # program hai ya shell mein built-in?</pre>
<pre class="out">netadmin@nms01:~$ which ls
/usr/bin/ls
netadmin@nms01:~$ type cd
cd is a shell builtin
netadmin@nms01:~$ man ls
LS(1)

NAME
       ls - list directory contents

COMMON USE
       ls -l        long listing (permissions, owner, size)
       ls -la       include hidden files
       ls -lh       human readable sizes</pre>
<p>Simulator manual page ka chhota teaching version dikhata hai. Real server kai pages ke options dikhata hai, jinhe <code>less</code> ki keys se scroll karte hain. <code>ls --help</code> real server par chalta hai, par simulator uska option summary print nahi karta. Manual page hi authority hai; kisi ki script mein anjaan option mile to use padho.</p>

<h3>History: do baar type mat karo</h3>
<pre class="out">netadmin@nms01:~$ history
    1  pwd
    2  whoami
    3  ls
    4  ls -l
    5  ls -la incoming
    6  history</pre>
<p><code>history</code> aapke pichhle commands ki list deta hai. Real server par <b>Ctrl+R</b> se search hota hai: Ctrl+R dabao, purane command ke kuch letters type karo, Enter dabao. <code>!!</code> pichhla command repeat karta hai (<code>sudo !!</code> ke roop mein kaam aata hai).</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Bahut bade log ya binary file par <code>cat</code>: screen noise se bhar jaati hai. Ctrl+C se roko, phir <code>less</code> use karo. (2) File extension par bharosa. <code>notes.txt</code> naam ki file mein kuch bhi ho sakta hai; <code>file</code> sach batata hai. (3) Har option ke liye web search, jabki <code>man</code> usi server ke installed version ke liye exact hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>cat</code> print karta hai, <code>less</code> page karta hai, <code>head</code> aur <code>tail</code> peek karte hain. <code>which</code> PATH par program dhoondhta hai; <code>type</code> shell builtins (jaise <code>cd</code>) aur aliases bhi pehchanta hai. <code>cd</code> builtin hai, isliye <code>which cd</code> kuch nahi dhoondh sakta.</p></div>

<div class="scn"><h4>Woh disk jo 100% bhar gayi</h4><p>Monday ko syslog server par router logs aana band ho gaye. Kisi ne koi router nahi badla tha. Ek engineer ne login karke <code>df -h</code> chalaya: logs wali disk <code>100%</code> dikha rahi thi. Weekend mein ek runaway debug file ne use bhar diya tha. Usne bada file dhoondha, hataya, aur logs phir chalne lage. Network kabhi galat nahi tha.</p><p><b>Lesson:</b> jab koi Linux service "kaam karna band" kare, to pehle disk space dekho, phir logs.</p></div>

<div class="iv"><p class="q">"2 GB ki log file kaise padhoge?"</p><p><code>cat</code> se nahi. <code>less</code> se page karunga aur <code>/</code> se search karunga, ya latest entries ke liye <code>tail -n 100</code>, ya jo lines chahiye unhe nikaalne ke liye <code>grep</code>. Batao ki <code>less</code> poori file memory mein load nahi karta, isiliye badi files par safe hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>cat</code> chhoti files print karta hai; <code>less</code> badi files page karta hai (q se quit).</li>
<li><code>file</code> batata hai file asal mein kya hai; <code>stat</code> size, permissions, owner aur times dikhata hai.</li>
<li><code>wc -l</code> lines ginta hai; <code>df -h</code> disk usage dikhata hai.</li>
<li><code>man command</code> built-in manual hai; <code>which</code> aur <code>type</code> commands locate karte hain.</li>
<li><code>history</code> aur Ctrl+R dobara type karne se bachate hain.</li>
</ul></div>
`}};export{e as default};