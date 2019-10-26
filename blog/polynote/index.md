# Exploring Polynote 

*10/26/2019* | Alex Michael

<div style='text-align: center;'>
<img src='img/logo.svg' height='50' style='background:linear-gradient(to bottom, #444444, black); padding:10px; border-radius: 10px;'>
</div>


<br/>[Polynote](https://medium.com/netflix-techblog/open-sourcing-polynote-an-ide-inspired-polyglot-notebook-7f929d3f447) \([HN](https://news.ycombinator.com/item?id=21337260)\), open-sourced by Netflix this week, is being called the Jupyter Notebook killer.  This is a really high bar, because I think Jupyter Notebook is an awesome and creative piece of technology (respect to the developers) but maybe with the release of Polynote, the notebook ecosystem will get even better.  The key features of Polynote that make it potentially so good are that:
1. __It is a ployglot:__ it supports Scala as a first-class language (alongside Python and SQL).
1. __Polynote acts like an IDE:__ Some of my favorites include like visualizing state, visualizing of data without cluttering the notebook (using matplotlib integration), and text editing features like autocompletion and error highlighting.

Alot of the features that are really impressive about Polynote seem to come from actual use at Netflix so I am very confident that this software will be useful!  You can read more about Polynote in this [article](https://towardsdatascience.com/what-you-need-to-know-about-netflixs-jupyter-killer-polynote-dbe7106145f5?source=friends_link&sk=33e35e44208b1570f3c7fa31a36f4d0a) from Towards Data Science.

<div style='text-align: center; padding: 0 0 10px 50px'>
    <br />
    <img src='img/polynote-in-action.gif' height='300'>
    <p><i>Looks pretty sweet!</i></p>
</div>

## Installation

While the installation, isn't super interesting, I hope that I can save someone a bit of the chagrin of installing this.  Installation was bit of a pain, it wasn't an easy one-line installation process like Jupyter, hopefully this will improve as the software matures.  Also, it isn't yet possible to use Polynote on Windows, only Mac and Linux.  I am installing on Debian 10, so the steps here will focus on that process.

1. __Install Java:__ Polynote requires Java 8, which is not in the Debian package repository, which mean you have to install it manually.
	* The Java 8 JDK can be found [here](https://jdk.java.net/java-se-ri/8), pick the appropriate archive and download it (downloading from the main Oracle site means you have to sign in and go through a whole painful process).
    ```bash
    # make the directory
    wget https://download.java.net/openjdk/jdk8u40/ri/jdk_ri-8u40-b25-linux-x64-10_feb_2015.tar.gz
    sudo mkdir /usr/lib/jvm

    INSTALL_DIR=/usr/lib/jvm/

    # move Java 8 jdk to default installation location
    tar -xvzf jdk_ri-8u40-b25-linux-x64-10_feb_2015.tar.gz
    rm jdk_ri-8u40-b25-linux-x64-10_feb_2015.tar.gz
    sudo mv java-se-8u40-ri $INSTALL_DIR

    # set your environment variables
    export JAVA_HOME=/usr/lib/jvm/java-se-8u40-ri
    export PATH=$JAVA_HOME/bin:$PATH
    ```
1. Download and install Spark (optional)
    ```bash

    ```

## First Impressions

After the minor headache of installing Polynote, trying to get it to run.  I finally was able to start loading some data.  My first reaction to Polynote was that it has a lot of the features that I really wanted in Jupyter and in terms of data visualization, it acts a lot like a generalization of RStudio for large scale data-science.