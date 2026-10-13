var e={id:`filters-cli`,h:{en:`Filters, runners and a command-line backup tool`,hi:`Filters, runners aur command-line backup tool`},body:{en:`
<p>A tool that always touches every device is a tool people are afraid to run. This chapter (Lab 1, step 5) adds three things to <code>nrbackup.py</code>: <b>filters</b> to choose the hosts, a <b>dry run</b> that shows what would happen, and <b>options</b> so cron and humans can use the same script. It also explains the two runners.</p>

<h3>An analogy: the guest list</h3>
<p>A doorman with a guest list lets in "everyone from Pune", or "everyone who is on the list and wears a badge", or "everybody except trainees". A Nornir filter is that list: it returns a <b>new</b> Nornir object that contains only the matching hosts, and the original keeps all of them.</p>

<h3>Filters</h3>
<pre class="code">print("site=pune             ", names(nr.filter(site="pune")))
print("group ios             ", names(nr.filter(F(groups__contains="ios"))))
print("ios and pune          ", names(nr.filter(F(groups__contains="ios") &amp; F(site="pune"))))
print("pune or hyderabad     ", names(nr.filter(F(site="pune") | F(site="hyderabad"))))
print("not cisco_ios         ", names(nr.filter(~F(platform="cisco_ios"))))
print("filter_func (cisco_*) ", names(nr.filter(filter_func=lambda h: h.platform.startswith("cisco"))))
print("chained               ", names(nr.filter(site="pune").filter(platform="arista_eos")))</pre>
<pre class="out">AUTO01$ python3 filters.py
site=pune              ['e1', 'r1']
group ios              ['r1', 'r3']
<span class="hl">ios and pune           ['r1']</span>
pune or hyderabad      ['e1', 'n1', 'r1', 'r3']
not cisco_ios          ['e1', 'j1', 'n1']
platform has 'ios'     ['r1', 'r3']
junos or eos groups    ['e1', 'j1']
filter_func (cisco_*)  ['n1', 'r1', 'r3']
<span class="hl">chained                ['e1']</span>
nothing matches        [] 0
original unchanged     5 hosts</pre>
<p>Three styles cover almost everything. <b>Keyword filter</b>: <code>nr.filter(site="pune")</code> matches hosts whose data (or attribute) equals the value. <b>F objects</b> add operators: <code>__contains</code> on a list (<code>groups__contains="ios"</code>) or a string (<code>platform__contains="ios"</code>), <code>__any</code> to match any of several values, and the symbols <code>&amp;</code> (and), <code>|</code> (or), <code>~</code> (not). <b>filter_func</b> takes any Python function that gets a host and returns true or false; use it when the rule is "starts with cisco" or needs real logic. Filters can be chained, as in the line that shows <code>e1</code>.</p>
<p>A filter that matches nothing gives a Nornir object with zero hosts. <code>nr.run()</code> on it does nothing and raises no error. That is safe, but it hides typos: Lab 2 has a filter that selects nobody. Always print how many hosts you selected.</p>

<h3>The runners</h3>
<pre class="out">AUTO01$ python3 runners.py
<span class="hl">default runner: ThreadedRunner | workers in config: 10</span>
<span class="hl">serial runner : SerialRunner</span>
threaded order: ['r1', 'j1', 'e1', 'n1', 'r3'] | failed: ['r3']
serial order: ['r1', 'j1', 'e1', 'n1', 'r3'] | failed: ['r3']</pre>
<p>The default <b>threaded</b> runner starts a pool of threads (<code>num_workers</code> in <code>config.yaml</code>) and runs the task on many hosts at once. SSH is waiting time, so threads give a real speed-up on real gear, as you saw in <code>py-concurrency</code>. The <b>serial</b> runner takes one host at a time; use it to debug, or when a change must not hit two devices together. Switch with <code>nr.with_runner(SerialRunner())</code>, importing it from <code>nornir.plugins.runners</code>. Do not rely on the order of results from threads. In the lab the threads run one after the other, so you will not see a speed-up, and the order is always the inventory order.</p>

<h3>Options and dry run</h3>
<p>The new <code>nrbackup.py</code> has an <code>argparse</code> interface. The wiring to Nornir is short.</p>
<pre class="code"><span class="hl">nr = InitNornir(config_file=args.config, dry_run=args.dry_run)</span>
if args.group:
<span class="hl">    nr = nr.filter(F(groups__contains=args.group))</span>
if args.site:
    nr = nr.filter(site=args.site)
<span class="hl">if not args.dry_run:</span>
    os.makedirs(folder, exist_ok=True)
<span class="hl">if args.dry_run:</span>
    print_result(result, vars=["diff"])</pre>
<pre class="out">options:
  -h, --help            show this help message and exit
  -c, --config CONFIG   Nornir config file (default: config.yaml)
  -o, --outdir OUTDIR   folder for the backups (default: backups)
  -g, --group GROUP     only the hosts of this group
  -s, --site SITE       only the hosts of this site
  -n, --dry-run         show what would be written, write nothing</pre>
<p><code>dry_run=True</code> on <code>InitNornir</code> is a global flag. <code>write_file</code> respects it: it compares, builds the diff, and does <b>not</b> write. The script also skips <code>os.makedirs</code> in that mode, so a dry run really leaves the disk untouched.</p>
<pre class="out"><span class="hl">AUTO01$ python3 nrbackup.py -n -g junos -o drytest</span>
<span class="hl">j1  changed   30 lines -&gt; drytest/2026-09-29/j1.cfg</span>
backup**************************************************************************
<span class="hl">* j1 ** changed : True *********************************************************</span>
<span class="hl">vvvv backup ** changed : True vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO</span>
---- netmiko_send_command ** changed : False ----------------------------------- INFO
<span class="hl">---- write_file ** changed : True ---------------------------------------------- INFO</span>
<span class="hl">--- drytest/2026-09-29/j1.cfg</span>
+++ new_file
@@ -0,0 +1,30 @@
...
^^^^ END backup ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
1 saved, 0 failed
<span class="hl">AUTO01$ ls drytest</span>
<span class="hl">ls: cannot access 'drytest': No such file or directory</span>
AUTO01$ python3 nrbackup.py -s pune
r1  unchanged 57 lines -&gt; backups/2026-09-29/r1.cfg
e1  unchanged 20 lines -&gt; backups/2026-09-29/e1.cfg
2 saved, 0 failed</pre>
<p>The dry run shows the host, the diff with the full new content (the folder <code>drytest</code> does not exist, so everything is new), and then the summary. The listing at the end proves that nothing was created. The last block filters by site.</p>

<h3>Paths and cron</h3>
<p>The paths inside <code>config.yaml</code> (<code>inventory/hosts.yaml</code>) are relative to the <b>folder you start from</b>, not to the script. Cron starts jobs in the home folder.</p>
<pre class="out">AUTO01$ cd /tmp &amp;&amp; python3 /home/netadmin/nrbackup.py 2&gt;&amp;1 | tail -1; cd /home/netadmin
<span class="hl">FileNotFoundError: [Errno 2] No such file or directory: 'config.yaml'</span></pre>
<pre class="code"><span class="hl">os.chdir(os.path.dirname(os.path.abspath(sys.argv[0])))<span class="c">      # the paths inside config.yaml are relative to here</span></span></pre>
<pre class="out">AUTO01$ cd /tmp &amp;&amp; python3 /home/netadmin/cwd.py; cd /home/netadmin
5 hosts; working folder /home/netadmin</pre>
<p>One line at the top of the script fixes it, and it runs correctly from any folder.</p>

<div class="warn"><p><b>Common mistake.</b> Testing a filter with a typo, such as <code>site="Pune"</code> instead of <code>"pune"</code>. Matching is exact, the result is zero hosts, and the script ends with "0 saved, 0 failed" and exit code 0. Print <code>len(nr.inventory.hosts)</code> before you run.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>dry_run</code> is honoured only by tasks that look at it, such as <code>write_file</code> and <code>napalm_configure</code>. A task that sends commands with <code>netmiko_send_config</code> does not check it. Chapter 8 shows how to protect such a task yourself.</p></div>

<div class="scn"><h4>The backup that ran from the wrong folder</h4><p>The script worked on the engineer's laptop. In cron it failed every night with <code>FileNotFoundError: 'config.yaml'</code>, because cron started in another folder. Nobody read the mail. The fix was one <code>os.chdir</code> line, and a check that the cron job's exit code reaches the monitoring.</p><p><b>Lesson:</b> make the script independent of the folder it starts from.</p></div>

<div class="iv"><p class="q">"How do you limit a Nornir run to some devices, and how do you test it safely?"</p><p>I use <code>nr.filter()</code> with a keyword, an <code>F</code> expression or a <code>filter_func</code>, and print how many hosts matched. For a safe test I create Nornir with <code>dry_run=True</code>, so tasks that honour it, like <code>write_file</code>, show a diff and change nothing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>nr.filter()</code> returns a new object; the original is unchanged.</li>
<li>Keyword, <code>F</code> with <code>&amp; | ~ __contains __any</code>, and <code>filter_func</code> cover all cases.</li>
<li>An empty filter runs nothing and says nothing: check the count.</li>
<li>Threaded runner for speed, serial runner for debugging.</li>
<li>Relative paths follow the working folder: change into the script's folder first.</li>
</ul></div>
`,hi:`
<p>Jo tool hamesha har device ko chhoota hai, usse log chalane se darte hain. Yeh chapter (Lab 1, step 5) <code>nrbackup.py</code> mein teen cheezein jodta hai: hosts chunne ke liye <b>filters</b>, <b>dry run</b> jo dikhaye kya hoga, aur <b>options</b> taaki cron aur insaan ek hi script use kar sakein. Saath mein dono runners samjhata hai.</p>

<h3>Ek analogy: guest list</h3>
<p>Darwan ke paas guest list hoti hai: "Pune ke sab log", ya "list mein hon aur badge pehne hon", ya "trainees ke siwa sab". Nornir filter wahi list hai: yeh ek <b>naya</b> Nornir object deta hai jisme sirf matching hosts hote hain, aur original ke paas sab rehte hain.</p>

<h3>Filters</h3>
<pre class="code">print("site=pune             ", names(nr.filter(site="pune")))
print("group ios             ", names(nr.filter(F(groups__contains="ios"))))
print("ios and pune          ", names(nr.filter(F(groups__contains="ios") &amp; F(site="pune"))))
print("pune or hyderabad     ", names(nr.filter(F(site="pune") | F(site="hyderabad"))))
print("not cisco_ios         ", names(nr.filter(~F(platform="cisco_ios"))))
print("filter_func (cisco_*) ", names(nr.filter(filter_func=lambda h: h.platform.startswith("cisco"))))
print("chained               ", names(nr.filter(site="pune").filter(platform="arista_eos")))</pre>
<pre class="out">AUTO01$ python3 filters.py
site=pune              ['e1', 'r1']
group ios              ['r1', 'r3']
<span class="hl">ios and pune           ['r1']</span>
pune or hyderabad      ['e1', 'n1', 'r1', 'r3']
not cisco_ios          ['e1', 'j1', 'n1']
platform has 'ios'     ['r1', 'r3']
junos or eos groups    ['e1', 'j1']
filter_func (cisco_*)  ['n1', 'r1', 'r3']
<span class="hl">chained                ['e1']</span>
nothing matches        [] 0
original unchanged     5 hosts</pre>
<p>Teen style lagbhag sab kuch cover karte hain. <b>Keyword filter</b>: <code>nr.filter(site="pune")</code> un hosts ko match karta hai jinka data (ya attribute) value ke barabar ho. <b>F objects</b> operators jodte hain: list par <code>__contains</code> (<code>groups__contains="ios"</code>) ya string par (<code>platform__contains="ios"</code>), kai values mein se kisi ek ke liye <code>__any</code>, aur symbols <code>&amp;</code> (aur), <code>|</code> (ya), <code>~</code> (nahi). <b>filter_func</b> koi bhi Python function leta hai jo host le aur true ya false de; jab rule "cisco se shuru ho" ho ya asli logic chahiye, tab use karo. Filters chain ho sakte hain, jaise us line mein jo <code>e1</code> dikhati hai.</p>
<p>Jo filter kuch match na kare woh zero hosts wala Nornir object deta hai. Us par <code>nr.run()</code> kuch nahi karta aur error bhi nahi uthata. Yeh safe hai, par typos chhupa deta hai: Lab 2 mein ek filter hai jo kisi ko select nahi karta. Hamesha print karo kitne hosts select hue.</p>

<h3>Runners</h3>
<pre class="out">AUTO01$ python3 runners.py
<span class="hl">default runner: ThreadedRunner | workers in config: 10</span>
<span class="hl">serial runner : SerialRunner</span>
threaded order: ['r1', 'j1', 'e1', 'n1', 'r3'] | failed: ['r3']
serial order: ['r1', 'j1', 'e1', 'n1', 'r3'] | failed: ['r3']</pre>
<p>Default <b>threaded</b> runner threads ka pool (<code>config.yaml</code> ka <code>num_workers</code>) chalata hai aur task ko kai hosts par ek saath chalata hai. SSH mein waiting time hota hai, isliye real gear par threads se asli speed-up milta hai, jaisa <code>py-concurrency</code> mein dekha. <b>Serial</b> runner ek time par ek host leta hai; debug ke liye use karo, ya jab change do devices par ek saath na jaana ho. <code>nr.with_runner(SerialRunner())</code> se badlo, <code>SerialRunner</code> ko <code>nornir.plugins.runners</code> se import karke. Threads ke results ke order par bharosa mat karo. Lab mein threads ek ke baad ek chalte hain, isliye speed-up nahi dikhega, aur order hamesha inventory ka order hota hai.</p>

<h3>Options aur dry run</h3>
<p>Naye <code>nrbackup.py</code> mein <code>argparse</code> interface hai. Nornir se wiring chhoti hai.</p>
<pre class="code"><span class="hl">nr = InitNornir(config_file=args.config, dry_run=args.dry_run)</span>
if args.group:
<span class="hl">    nr = nr.filter(F(groups__contains=args.group))</span>
if args.site:
    nr = nr.filter(site=args.site)
<span class="hl">if not args.dry_run:</span>
    os.makedirs(folder, exist_ok=True)
<span class="hl">if args.dry_run:</span>
    print_result(result, vars=["diff"])</pre>
<pre class="out">options:
  -h, --help            show this help message and exit
  -c, --config CONFIG   Nornir config file (default: config.yaml)
  -o, --outdir OUTDIR   folder for the backups (default: backups)
  -g, --group GROUP     only the hosts of this group
  -s, --site SITE       only the hosts of this site
  -n, --dry-run         show what would be written, write nothing</pre>
<p><code>InitNornir</code> par <code>dry_run=True</code> global flag hai. <code>write_file</code> use maanta hai: milata hai, diff banata hai, aur <b>nahi</b> likhta. Script us mode mein <code>os.makedirs</code> bhi chhod deti hai, isliye dry run sach mein disk ko haath nahi lagata.</p>
<pre class="out"><span class="hl">AUTO01$ python3 nrbackup.py -n -g junos -o drytest</span>
<span class="hl">j1  changed   30 lines -&gt; drytest/2026-09-29/j1.cfg</span>
backup**************************************************************************
<span class="hl">* j1 ** changed : True *********************************************************</span>
<span class="hl">vvvv backup ** changed : True vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO</span>
---- netmiko_send_command ** changed : False ----------------------------------- INFO
<span class="hl">---- write_file ** changed : True ---------------------------------------------- INFO</span>
<span class="hl">--- drytest/2026-09-29/j1.cfg</span>
+++ new_file
@@ -0,0 +1,30 @@
...
^^^^ END backup ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
1 saved, 0 failed
<span class="hl">AUTO01$ ls drytest</span>
<span class="hl">ls: cannot access 'drytest': No such file or directory</span>
AUTO01$ python3 nrbackup.py -s pune
r1  unchanged 57 lines -&gt; backups/2026-09-29/r1.cfg
e1  unchanged 20 lines -&gt; backups/2026-09-29/e1.cfg
2 saved, 0 failed</pre>
<p>Dry run host, poore naye content ka diff (folder <code>drytest</code> maujood nahi, isliye sab naya hai) aur phir summary dikhata hai. Ant ki listing saabit karti hai ki kuch nahi bana. Aakhri block site ke hisaab se filter karta hai.</p>

<h3>Paths aur cron</h3>
<p><code>config.yaml</code> ke andar ke paths (<code>inventory/hosts.yaml</code>) us <b>folder ke relative</b> hote hain jahan se aap start karte ho, script ke nahi. Cron jobs ko home folder mein start karta hai.</p>
<pre class="out">AUTO01$ cd /tmp &amp;&amp; python3 /home/netadmin/nrbackup.py 2&gt;&amp;1 | tail -1; cd /home/netadmin
<span class="hl">FileNotFoundError: [Errno 2] No such file or directory: 'config.yaml'</span></pre>
<pre class="code"><span class="hl">os.chdir(os.path.dirname(os.path.abspath(sys.argv[0])))<span class="c">      # the paths inside config.yaml are relative to here</span></span></pre>
<pre class="out">AUTO01$ cd /tmp &amp;&amp; python3 /home/netadmin/cwd.py; cd /home/netadmin
5 hosts; working folder /home/netadmin</pre>
<p>Script ke upar ki ek line isse theek kar deti hai, aur woh kisi bhi folder se sahi chalti hai.</p>

<div class="warn"><p><b>Common mistake.</b> Filter test karte waqt typo, jaise <code>"pune"</code> ki jagah <code>site="Pune"</code>. Matching exact hai, result zero hosts hai, aur script "0 saved, 0 failed" aur exit code 0 par khatam hoti hai. Run se pehle <code>len(nr.inventory.hosts)</code> print karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>dry_run</code> sirf wahi tasks maante hain jo use dekhte hain, jaise <code>write_file</code> aur <code>napalm_configure</code>. <code>netmiko_send_config</code> se commands bhejne wala task use check nahi karta. Chapter 8 dikhata hai aise task ko khud kaise bachana hai.</p></div>

<div class="scn"><h4>Galat folder se chali backup</h4><p>Script engineer ke laptop par chali. Cron mein har raat <code>FileNotFoundError: 'config.yaml'</code> se fail hui, kyunki cron kisi aur folder mein start hota hai. Mail kisi ne nahi padhi. Fix ek <code>os.chdir</code> line thi, aur yeh check ki cron job ka exit code monitoring tak pahunchta hai.</p><p><b>Lesson:</b> script ko us folder se azaad banao jahan se woh start hoti hai.</p></div>

<div class="iv"><p class="q">"Nornir run ko kuch devices tak kaise seemit karte ho, aur safely test kaise karte ho?"</p><p>Main <code>nr.filter()</code> keyword, <code>F</code> expression ya <code>filter_func</code> ke saath use karta hoon, aur print karta hoon kitne hosts match hue. Safe test ke liye Nornir ko <code>dry_run=True</code> se banata hoon, taaki jo tasks use maante hain, jaise <code>write_file</code>, diff dikhayein aur kuch na badlein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>nr.filter()</code> naya object deta hai; original nahi badalta.</li>
<li>Keyword, <code>F</code> (<code>&amp; | ~ __contains __any</code>) aur <code>filter_func</code> sab cases cover karte hain.</li>
<li>Khaali filter kuch nahi chalata aur kuch nahi kehta: count check karo.</li>
<li>Speed ke liye threaded runner, debug ke liye serial runner.</li>
<li>Relative paths working folder follow karte hain: pehle script ke folder mein jao.</li>
</ul></div>
`}};export{e as default};